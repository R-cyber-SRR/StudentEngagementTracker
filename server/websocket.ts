import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { log } from "./vite";
import { storage } from "./storage";
import { 
  type WebSocketMessage, 
  type StudentActivityEvent, 
  type StudentConnectionEvent,
  type EngagementUpdate,
  type AlertEvent,
  type StudentEngagementData
} from "@shared/schema";
import { calculateEngagement, detectAlert } from "./engagement";

// Store connected clients
const clients = new Map<string, WebSocket>();
const studentSessions = new Map<string, string>(); // studentId -> sessionId
const sessionStudents = new Map<string, Set<string>>(); // sessionId -> Set of studentIds

// Engagement data cache
const engagementData = new Map<string, number[]>(); // sessionId -> historical engagement data
const MAX_ENGAGEMENT_HISTORY = 30; // Last 30 data points

export function setupWebSocketServer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    let clientId: string | undefined;
    let clientType: "student" | "educator" | undefined;
    let sessionId: string | undefined;

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString()) as WebSocketMessage;
        
        // Handle different message types
        if (data.type === 'connection') {
          handleConnection(ws, data);
          clientId = data.studentId;
          clientType = "student";
          sessionId = data.sessionId;
        } else if (data.type === 'activity') {
          handleActivityEvent(data);
          clientId = data.studentId;
          clientType = "student";
          sessionId = data.sessionId;
        } else if (data.type === 'engagementUpdate') {
          // This is typically a server-generated message, but could be received from admin client
          clientType = "educator";
          sessionId = data.sessionId;
        }
      } catch (error) {
        log(`Error handling WebSocket message: ${error}`, "websocket");
      }
    });

    ws.on("close", () => {
      if (clientId && clientType === "student") {
        handleStudentDisconnect(clientId);
      }
      
      if (clientId) {
        clients.delete(clientId);
      }
    });
  });

  // Start the engagement analysis interval
  setInterval(analyzeEngagementForAllSessions, 5000);
  
  return wss;
}

async function handleConnection(ws: WebSocket, data: StudentConnectionEvent) {
  const { studentId, sessionId, studentName, action } = data;
  
  if (action === 'connect') {
    // Store the client connection
    clients.set(studentId, ws);
    
    // Update session mappings
    studentSessions.set(studentId, sessionId);
    
    if (!sessionStudents.has(sessionId)) {
      sessionStudents.set(sessionId, new Set());
    }
    sessionStudents.get(sessionId)?.add(studentId);
    
    // Create or update student in storage
    const existingStudents = await storage.getStudentBySessionId(sessionId);
    const existingStudent = existingStudents.find(s => s.id.toString() === studentId);
    
    if (existingStudent) {
      await storage.updateStudentStatus(existingStudent.id, "online");
    } else {
      await storage.createStudent({
        name: studentName,
        email: `${studentId}@example.com`, // Placeholder email
        sessionId
      });
    }
    
    log(`Student ${studentName} (${studentId}) connected to session ${sessionId}`, "websocket");
    
    // Broadcast updated student list to educators
    broadcastStudentList(sessionId);
  }
}

async function handleActivityEvent(data: StudentActivityEvent) {
  const { studentId, sessionId, eventType } = data;
  
  // Store the activity event
  try {
    const studentIdNum = parseInt(studentId);
    if (!isNaN(studentIdNum)) {
      await storage.createActivityEvent({
        studentId: studentIdNum,
        eventType,
        data: JSON.stringify(data.data || {})
      });
      
      // Update student's last activity timestamp
      const students = await storage.getStudentBySessionId(sessionId);
      const student = students.find(s => s.id.toString() === studentId);
      
      if (student) {
        // Calculate a new attention score based on the event
        const newAttentionScore = calculateAttentionScoreFromEvent(student.attentionScore || 0, eventType);
        await storage.updateStudentAttention(student.id, newAttentionScore);
      }
      
      // Check for potential distraction alerts
      const alert = detectAlert(eventType, sessionId);
      if (alert) {
        await storage.createAlert(alert);
        broadcastAlert(alert, sessionId);
      }
    }
  } catch (error) {
    log(`Error handling activity event: ${error}`, "websocket");
  }
}

async function handleStudentDisconnect(studentId: string) {
  const sessionId = studentSessions.get(studentId);
  if (sessionId) {
    // Update session mappings
    studentSessions.delete(studentId);
    sessionStudents.get(sessionId)?.delete(studentId);
    
    // Update student status in storage
    const students = await storage.getStudentBySessionId(sessionId);
    const student = students.find(s => s.id.toString() === studentId);
    
    if (student) {
      await storage.updateStudentStatus(student.id, "offline");
    }
    
    log(`Student ${studentId} disconnected from session ${sessionId}`, "websocket");
    
    // Broadcast updated student list to educators
    broadcastStudentList(sessionId);
  }
}

function calculateAttentionScoreFromEvent(currentScore: number, eventType: string): number {
  // Apply different attention effects based on event type
  switch (eventType) {
    case 'click':
    case 'scroll':
      // Positive interactions - small boost
      return Math.min(currentScore + 2, 100);
    case 'focus':
      // Window focus - major boost
      return Math.min(currentScore + 10, 100);
    case 'blur':
    case 'tabSwitch':
      // Negative interactions - significant reduction
      return Math.max(currentScore - 15, 0);
    default:
      return currentScore;
  }
}

async function analyzeEngagementForAllSessions() {
  for (const [sessionId, students] of sessionStudents.entries()) {
    if (students.size === 0) continue;
    
    try {
      // Get all students for this session
      const sessionStudentsList = await storage.getStudentBySessionId(sessionId);
      
      // Calculate overall engagement for the session
      const { overallAttention, studentsData } = await calculateEngagement(sessionId, sessionStudentsList);
      
      // Store engagement history
      if (!engagementData.has(sessionId)) {
        engagementData.set(sessionId, []);
      }
      
      const history = engagementData.get(sessionId)!;
      history.push(overallAttention);
      
      // Keep only the last N data points
      if (history.length > MAX_ENGAGEMENT_HISTORY) {
        history.shift();
      }
      
      // Create engagement update message
      const updateMessage: EngagementUpdate = {
        type: 'engagementUpdate',
        sessionId,
        overallAttention,
        studentsData,
        timestamp: Date.now()
      };
      
      // Broadcast to all educators for this session
      broadcastToEducators(sessionId, updateMessage);
    } catch (error) {
      log(`Error analyzing engagement for session ${sessionId}: ${error}`, "websocket");
    }
  }
}

async function broadcastStudentList(sessionId: string) {
  try {
    // Get updated student list
    const sessionStudentsList = await storage.getStudentBySessionId(sessionId);
    
    // Calculate engagement data
    const { overallAttention, studentsData } = await calculateEngagement(sessionId, sessionStudentsList);
    
    // Create engagement update message
    const updateMessage: EngagementUpdate = {
      type: 'engagementUpdate',
      sessionId,
      overallAttention,
      studentsData,
      timestamp: Date.now()
    };
    
    // Broadcast to all educators for this session
    broadcastToEducators(sessionId, updateMessage);
  } catch (error) {
    log(`Error broadcasting student list for session ${sessionId}: ${error}`, "websocket");
  }
}

async function broadcastAlert(alert: any, sessionId: string) {
  const alertMessage: AlertEvent = {
    type: 'alert',
    alertId: alert.id.toString(),
    sessionId,
    alertType: alert.alertType,
    message: alert.message,
    severity: alert.severity,
    timestamp: Date.now()
  };
  
  // Broadcast to all educators for this session
  broadcastToEducators(sessionId, alertMessage);
}

function broadcastToEducators(sessionId: string, message: any) {
  // In a real app, we'd filter to only send to educators for this sessionId
  // For this demo, we'll broadcast to all clients
  for (const [clientId, ws] of clients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
}

export function getEngagementHistory(sessionId: string): number[] {
  return engagementData.get(sessionId) || [];
}
