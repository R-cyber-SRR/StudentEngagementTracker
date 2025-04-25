import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WebSocketProvider } from "@/components/ui/websocket-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Mail, UserPlus } from "lucide-react";
import { ConnectedStudents } from "@/components/ConnectedStudents";
import { useAuth } from "@/hooks/use-auth";
import { Student, EngagementUpdate } from "@/types";

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  const handleEngagementUpdate = (data: EngagementUpdate) => {
    setStudents(data.studentsData);
  };

  // Group students by status
  const highAttentionStudents = filteredStudents.filter(student => student.status === "High");
  const mediumAttentionStudents = filteredStudents.filter(student => student.status === "Medium");
  const lowAttentionStudents = filteredStudents.filter(student => student.status === "Low");

  return (
    <WebSocketProvider onEngagementUpdate={handleEngagementUpdate}>
      <DashboardLayout
        title="Students"
        subtitle="Monitor and manage your students"
        studentCount={students.length}
      >
        {/* Search and filters header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="relative w-full md:w-96 mb-4 md:mb-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Message
            </Button>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">High Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{highAttentionStudents.length}</div>
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  {Math.round((highAttentionStudents.length / filteredStudents.length || 0) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medium Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{mediumAttentionStudents.length}</div>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                  {Math.round((mediumAttentionStudents.length / filteredStudents.length || 0) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{lowAttentionStudents.length}</div>
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  {Math.round((lowAttentionStudents.length / filteredStudents.length || 0) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students list */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Students in Current Session</CardTitle>
            <CardDescription>
              Viewing {filteredStudents.length} of {students.length} total students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <ConnectedStudents students={filteredStudents} />
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500">No students match your search criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DashboardLayout>
    </WebSocketProvider>
  );
}