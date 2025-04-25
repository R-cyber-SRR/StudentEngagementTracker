import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("educator"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Student activity model
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  sessionId: text("session_id").notNull(),
  connectionStatus: text("connection_status").notNull().default("offline"),
  lastActivity: timestamp("last_activity"),
  attentionScore: real("attention_score"),
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  email: true,
  sessionId: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Activity events
export const activityEvents = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  eventType: text("event_type").notNull(), // click, scroll, tabSwitch, etc.
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  data: text("data"), // JSON string with event details
});

export const insertActivityEventSchema = createInsertSchema(activityEvents).pick({
  studentId: true,
  eventType: true,
  data: true,
});

export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;
export type ActivityEvent = typeof activityEvents.$inferSelect;

// Session model
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  educatorId: integer("educator_id").notNull(),
  active: boolean("active").notNull().default(true),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  name: true,
  educatorId: true,
});

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

// Alert model
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  alertType: text("alert_type").notNull(), // distraction, inactivity, etc.
  message: text("message").notNull(),
  severity: text("severity").notNull(), // high, medium, low
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  resolved: boolean("resolved").notNull().default(false),
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  sessionId: true,
  alertType: true,
  message: true,
  severity: true,
});

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// Message types for WebSocket communication
export type StudentActivityEvent = {
  type: 'activity';
  studentId: string;
  sessionId: string;
  eventType: 'click' | 'scroll' | 'tabSwitch' | 'focus' | 'blur';
  timestamp: number;
  data?: any;
};

export type StudentConnectionEvent = {
  type: 'connection';
  action: 'connect' | 'disconnect';
  studentId: string;
  sessionId: string;
  studentName: string;
  timestamp: number;
};

export type EngagementUpdate = {
  type: 'engagementUpdate';
  sessionId: string;
  overallAttention: number;
  studentsData: StudentEngagementData[];
  timestamp: number;
};

export type AlertEvent = {
  type: 'alert';
  alertId: string;
  sessionId: string;
  alertType: string;
  message: string;
  severity: string;
  timestamp: number;
};

export type StudentEngagementData = {
  studentId: string;
  name: string;
  attentionScore: number;
  status: string;
  lastActivity: number;
};

export type WebSocketMessage = 
  | StudentActivityEvent 
  | StudentConnectionEvent 
  | EngagementUpdate 
  | AlertEvent;
