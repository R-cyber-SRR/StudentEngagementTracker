import { 
  users, type User, type InsertUser,
  students, type Student, type InsertStudent,
  activityEvents, type ActivityEvent, type InsertActivityEvent,
  sessions, type Session, type InsertSession,
  alerts, type Alert, type InsertAlert,
  type StudentEngagementData
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  getStudentBySessionId(sessionId: string): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentStatus(id: number, connectionStatus: string): Promise<Student | undefined>;
  updateStudentAttention(id: number, attentionScore: number): Promise<Student | undefined>;
  
  // Activity event methods
  createActivityEvent(event: InsertActivityEvent): Promise<ActivityEvent>;
  getActivityEventsByStudent(studentId: number, limit?: number): Promise<ActivityEvent[]>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  createSession(session: InsertSession): Promise<Session>;
  endSession(id: number): Promise<Session | undefined>;
  getActiveSessions(): Promise<Session[]>;
  
  // Alert methods
  createAlert(alert: InsertAlert): Promise<Alert>;
  getAlertsBySession(sessionId: number, limit?: number): Promise<Alert[]>;
  resolveAlert(id: number): Promise<Alert | undefined>;
  
  // Session store for auth
  sessionStore: any;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private activityEvents: ActivityEvent[];
  private sessions: Map<number, Session>;
  private alerts: Map<number, Alert>;
  
  private userId: number;
  private studentId: number;
  private eventId: number;
  private sessionId: number;
  private alertId: number;
  
  public sessionStore: any;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.activityEvents = [];
    this.sessions = new Map();
    this.alerts = new Map();
    
    this.userId = 1;
    this.studentId = 1;
    this.eventId = 1;
    this.sessionId = 1;
    this.alertId = 1;
    
    // Create session store for auth
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Create demo user - will be overridden with the hashed password by auth.ts later
    this.createUser({
      username: "teacher",
      password: "fc93b4c201b23a6654d94560250072c07e8759d526b4d69402f5a6aad862d3d17f93c4d56bdc3f9d7b1ead3da3af245c0feb0e80fb5330a89272bb1a9d7cae3.ca7bf82e35c9f12d",
      name: "Jane Doe",
      email: "teacher@example.com",
      role: "educator"
    });
    
    // Create some initial data
    this.createSession({
      name: "Introduction to Programming Concepts",
      educatorId: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || 'educator'
    };
    this.users.set(id, user);
    return user;
  }
  
  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async getStudentBySessionId(sessionId: string): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      (student) => student.sessionId === sessionId
    );
  }
  
  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.studentId++;
    const student: Student = {
      ...insertStudent,
      id,
      connectionStatus: "online",
      lastActivity: new Date(),
      attentionScore: 100
    };
    this.students.set(id, student);
    return student;
  }
  
  async updateStudentStatus(id: number, connectionStatus: string): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent: Student = {
      ...student,
      connectionStatus,
      lastActivity: new Date()
    };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  async updateStudentAttention(id: number, attentionScore: number): Promise<Student | undefined> {
    const student = this.students.get(id);
    if (!student) return undefined;
    
    const updatedStudent: Student = {
      ...student,
      attentionScore,
      lastActivity: new Date()
    };
    this.students.set(id, updatedStudent);
    return updatedStudent;
  }
  
  // Activity event methods
  async createActivityEvent(insertEvent: InsertActivityEvent): Promise<ActivityEvent> {
    const id = this.eventId++;
    const event: ActivityEvent = {
      ...insertEvent,
      id,
      data: insertEvent.data || null, // Ensure data is not undefined
      timestamp: new Date()
    };
    this.activityEvents.push(event);
    return event;
  }
  
  async getActivityEventsByStudent(studentId: number, limit: number = 100): Promise<ActivityEvent[]> {
    return this.activityEvents
      .filter((event) => event.studentId === studentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    const session: Session = {
      ...insertSession,
      id,
      active: true,
      startTime: new Date(),
      endTime: null
    };
    this.sessions.set(id, session);
    return session;
  }
  
  async endSession(id: number): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession: Session = {
      ...session,
      active: false,
      endTime: new Date()
    };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async getActiveSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter((session) => session.active);
  }
  
  // Alert methods
  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const alert: Alert = {
      ...insertAlert,
      id,
      timestamp: new Date(),
      resolved: false
    };
    this.alerts.set(id, alert);
    return alert;
  }
  
  async getAlertsBySession(sessionId: number, limit: number = 100): Promise<Alert[]> {
    return Array.from(this.alerts.values())
      .filter((alert) => alert.sessionId === sessionId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }
  
  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert: Alert = {
      ...alert,
      resolved: true
    };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }
}

export const storage = new MemStorage();
