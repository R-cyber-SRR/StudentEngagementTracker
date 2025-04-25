import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WebSocketMessage } from "@/types";
import { nanoid } from "nanoid";

export default function Student() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [sessionId, setSessionId] = useState('1'); // Default session ID
  const [eventsCount, setEventsCount] = useState(0);
  const [activityLog, setActivityLog] = useState<string[]>([]);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    // Generate a random student ID if not already set
    if (!studentId) {
      setStudentId(nanoid(8));
    }
    
    // Set a default name if not provided
    if (!studentName) {
      const names = [
        "Alex Smith", "Maria Johnson", "James Thompson", 
        "Lucy Chen", "Ryan Kim", "Sara Lee",
        "Michael Brown", "Emily Davis", "David Wilson"
      ];
      setStudentName(names[Math.floor(Math.random() * names.length)]);
    }
    
    return () => {
      // Clean up socket on unmount
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Connect to WebSocket server
  const connectWebSocket = () => {
    if (socket) {
      socket.close();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
      toast({
        title: "Connected to session",
        description: `You are now connected as ${studentName}`,
      });

      // Send connection event
      const connectionEvent: WebSocketMessage = {
        type: 'connection',
        action: 'connect',
        studentId,
        sessionId,
        studentName,
        timestamp: Date.now()
      };
      ws.send(JSON.stringify(connectionEvent));
      
      // Add to activity log
      setActivityLog(prev => [`Connected to session: ${sessionId}`, ...prev]);
    };

    ws.onclose = () => {
      setConnected(false);
      toast({
        title: "Disconnected from session",
        description: "WebSocket connection closed",
        variant: "destructive"
      });
      
      // Add to activity log
      setActivityLog(prev => ["Disconnected from session", ...prev]);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect to WebSocket server",
        variant: "destructive"
      });
    };

    setSocket(ws);
  };

  // Send activity event
  const sendActivityEvent = (eventType: 'click' | 'scroll' | 'tabSwitch' | 'focus' | 'blur', data?: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const event: WebSocketMessage = {
        type: 'activity',
        studentId,
        sessionId,
        eventType,
        timestamp: Date.now(),
        data
      };
      socket.send(JSON.stringify(event));
      setEventsCount(prev => prev + 1);
      
      // Add to activity log
      setActivityLog(prev => [`Sent ${eventType} event`, ...prev.slice(0, 9)]);
    } else {
      toast({
        title: "Not connected",
        description: "Connect to the session first",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Activity Simulator</h1>
          <p className="mt-2 text-gray-600">Simulate screen activity for the engagement monitoring system</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Connection</CardTitle>
            <CardDescription>Connect to a virtual classroom session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="studentName" className="text-sm font-medium text-gray-700">
                    Your Name
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    disabled={connected}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="sessionId" className="text-sm font-medium text-gray-700">
                    Session ID
                  </label>
                  <input
                    id="sessionId"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    disabled={connected}
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-gray-500">
              {connected ? (
                <span className="text-green-600">✓ Connected as {studentName}</span>
              ) : (
                <span>Not connected</span>
              )}
            </div>
            <Button
              onClick={connected ? () => socket?.close() : connectWebSocket}
              variant={connected ? "destructive" : "default"}
            >
              {connected ? "Disconnect" : "Connect"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Activity Simulator</CardTitle>
            <CardDescription>Send simulated screen activity events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={() => sendActivityEvent('click', { x: Math.random() * 1000, y: Math.random() * 800 })}
                disabled={!connected}
                variant="outline"
                className="h-24"
              >
                Simulate Click
              </Button>
              <Button 
                onClick={() => sendActivityEvent('scroll', { direction: 'down', amount: Math.random() * 300 })} 
                disabled={!connected}
                variant="outline"
                className="h-24"
              >
                Simulate Scroll
              </Button>
              <Button 
                onClick={() => sendActivityEvent('tabSwitch', { newTab: true })}
                disabled={!connected}
                variant="outline"
                className="h-24"
              >
                Simulate Tab Switch
                <br />
                <span className="text-xs text-red-500">(Reduces attention)</span>
              </Button>
              <Button 
                onClick={() => sendActivityEvent('focus', { windowFocused: true })}
                disabled={!connected}
                variant="outline"
                className="h-24"
              >
                Simulate Window Focus
                <br />
                <span className="text-xs text-green-500">(Increases attention)</span>
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-500">
              {eventsCount} events sent during this session
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>Recent events sent to the server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 overflow-y-auto bg-gray-50 p-3 rounded-md border border-gray-200">
              {activityLog.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No activity yet</div>
              ) : (
                <ul className="space-y-2">
                  {activityLog.map((log, index) => (
                    <li key={index} className="text-sm">
                      <span className="text-gray-400">{new Date().toLocaleTimeString()}: </span>
                      {log}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
