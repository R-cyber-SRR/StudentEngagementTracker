export type Student = {
  id: string;
  name: string;
  attentionScore: number;
  status: 'High' | 'Medium' | 'Low';
  lastActivity: number;
};

export type Alert = {
  id: string;
  alertType: string;
  message: string;
  severity: string;
  timestamp: number;
  timeAgo: string;
};

export type SessionInfo = {
  id: number;
  name: string;
  educatorId: number;
  active: boolean;
  startTime: string;
  endTime?: string;
};

export type EngagementData = {
  overallAttention: number;
  participationLevel: string;
  distractionAlerts: number;
  distractionChange: number;
  participationCount: number;
};

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
  studentsData: Student[];
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

export type WebSocketMessage = 
  | StudentActivityEvent 
  | StudentConnectionEvent 
  | EngagementUpdate 
  | AlertEvent;

export type EngagementChartData = {
  labels: string[];
  data: number[];
};
