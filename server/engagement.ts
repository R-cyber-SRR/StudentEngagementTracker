import { storage } from "./storage";
import { 
  type Student, 
  type StudentEngagementData,
  type InsertAlert
} from "@shared/schema";

const INACTIVITY_THRESHOLD_MS = 60000; // 1 minute

export async function calculateEngagement(
  sessionId: string,
  students: Student[]
): Promise<{ overallAttention: number; studentsData: StudentEngagementData[] }> {
  // If no students, return 0 engagement
  if (students.length === 0) {
    return { overallAttention: 0, studentsData: [] };
  }
  
  const now = Date.now();
  let totalAttention = 0;
  const studentsData: StudentEngagementData[] = [];
  
  for (const student of students) {
    // Skip offline students
    if (student.connectionStatus === "offline") continue;
    
    // Check if student has been inactive
    const lastActivityTime = student.lastActivity ? student.lastActivity.getTime() : 0;
    const inactiveTime = now - lastActivityTime;
    
    // Adjust attention score based on inactivity
    let adjustedAttention = student.attentionScore || 0;
    if (inactiveTime > INACTIVITY_THRESHOLD_MS) {
      // Reduce score for inactive students
      adjustedAttention = Math.max(0, adjustedAttention - Math.floor(inactiveTime / INACTIVITY_THRESHOLD_MS) * 10);
    }
    
    totalAttention += adjustedAttention;
    
    // Determine status based on attention score
    let status = "High";
    if (adjustedAttention < 40) status = "Low";
    else if (adjustedAttention < 70) status = "Medium";
    
    studentsData.push({
      studentId: student.id.toString(),
      name: student.name,
      attentionScore: adjustedAttention,
      status,
      lastActivity: lastActivityTime
    });
  }
  
  // Calculate overall attention as average of all students
  const activeStudents = students.filter(s => s.connectionStatus === "online").length;
  const overallAttention = activeStudents ? Math.round(totalAttention / activeStudents) : 0;
  
  return { overallAttention, studentsData };
}

export function detectAlert(eventType: string, sessionId: string): InsertAlert | null {
  // Simple alert detection based on event type
  if (eventType === 'tabSwitch' || eventType === 'blur') {
    return {
      sessionId: parseInt(sessionId),
      alertType: 'distraction',
      message: `Potential distraction detected: ${eventType}`,
      severity: 'medium'
    };
  }
  
  return null;
}

// Analyze a sequence of events to detect patterns
export async function analyzeEventSequence(
  studentId: number,
  sessionId: string
): Promise<{ alerts: InsertAlert[]; engagementChange: number }> {
  const events = await storage.getActivityEventsByStudent(studentId, 10);
  const alerts: InsertAlert[] = [];
  let engagementChange = 0;
  
  // Count tab switches and blurs
  const distractionEvents = events.filter(e => 
    e.eventType === 'tabSwitch' || e.eventType === 'blur'
  );
  
  // If multiple distraction events in a short period
  if (distractionEvents.length >= 3) {
    alerts.push({
      sessionId: parseInt(sessionId),
      alertType: 'multiple_distractions',
      message: `Student showing signs of disengagement with ${distractionEvents.length} distraction events`,
      severity: 'high'
    });
    engagementChange -= 20;
  }
  
  // Check for prolonged inactivity
  if (events.length > 0) {
    const lastEvent = events[0];
    const now = Date.now();
    const lastEventTime = lastEvent.timestamp.getTime();
    
    if (now - lastEventTime > 2 * 60 * 1000) { // 2 minutes
      alerts.push({
        sessionId: parseInt(sessionId),
        alertType: 'inactivity',
        message: `Student has been inactive for over 2 minutes`,
        severity: 'medium'
      });
      engagementChange -= 10;
    }
  }
  
  return { alerts, engagementChange };
}
