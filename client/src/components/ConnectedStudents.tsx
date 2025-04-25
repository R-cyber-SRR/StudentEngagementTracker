import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Student } from "@/types";

type ConnectedStudentsProps = {
  students: Student[];
};

export function ConnectedStudents({ students }: ConnectedStudentsProps) {
  // Format the status badge based on attention level
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "High":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            High
          </Badge>
        );
      case "Medium":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Medium
          </Badge>
        );
      case "Low":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Low
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Unknown
          </Badge>
        );
    }
  };

  // Get the status message based on attention score
  const getStatusMessage = (student: Student) => {
    if (student.attentionScore >= 90) {
      return `Taking notes (${student.attentionScore}% attention)`;
    } else if (student.attentionScore >= 70) {
      return `Following along (${student.attentionScore}% attention)`;
    } else if (student.attentionScore >= 40) {
      return `Occasional tab switching (${student.attentionScore}% attention)`;
    } else {
      return `Inactive (${student.attentionScore}% attention)`;
    }
  };

  // Get a random background color for avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-200 text-blue-600",
      "bg-purple-200 text-purple-600",
      "bg-green-200 text-green-600",
      "bg-yellow-200 text-yellow-600",
      "bg-pink-200 text-pink-600",
      "bg-indigo-200 text-indigo-600",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Connected Students</CardTitle>
          <CardDescription>Real-time activity status</CardDescription>
        </div>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {students.length} Active
        </Badge>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80 overflow-y-auto">
          <ul className="divide-y divide-gray-200">
            {students.map((student) => (
              <li 
                key={student.id} 
                className={`py-4 ${student.status === "Low" ? "bg-red-50" : ""}`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-full ${getAvatarColor(student.name)} flex items-center justify-center font-bold`}>
                    {getInitials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.name}
                    </p>
                    <p className={`text-sm ${student.status === "Low" ? "text-red-500" : "text-gray-500"} truncate`}>
                      {getStatusMessage(student)}
                    </p>
                  </div>
                  <div>
                    {getStatusBadge(student.status)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
