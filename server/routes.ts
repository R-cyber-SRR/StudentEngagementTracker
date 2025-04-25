import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupWebSocketServer, getEngagementHistory } from "./websocket";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);
  
  // API routes
  
  // Get active sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getActiveSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  
  // Get session by ID
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(parseInt(req.params.id));
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });
  
  // Create a new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const session = await storage.createSession(req.body);
      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to create session" });
    }
  });
  
  // End a session
  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const session = await storage.endSession(parseInt(req.params.id));
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to end session" });
    }
  });
  
  // Get students by session ID
  app.get("/api/sessions/:id/students", async (req, res) => {
    try {
      const students = await storage.getStudentBySessionId(req.params.id);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });
  
  // Get alerts by session ID
  app.get("/api/sessions/:id/alerts", async (req, res) => {
    try {
      const alerts = await storage.getAlertsBySession(parseInt(req.params.id));
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });
  
  // Get engagement history by session ID
  app.get("/api/sessions/:id/engagement", async (req, res) => {
    try {
      const history = getEngagementHistory(req.params.id);
      res.json(history);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch engagement data" });
    }
  });
  
  // Resolve an alert
  app.post("/api/alerts/:id/resolve", async (req, res) => {
    try {
      const alert = await storage.resolveAlert(parseInt(req.params.id));
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  return httpServer;
}
