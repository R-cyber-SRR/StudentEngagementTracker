import { cn } from "@/lib/utils";
import { BarChart3, Users, FileText, Settings } from "lucide-react";
import { Link, useRoute } from "wouter";

export function Sidebar() {
  const [isOnDashboard] = useRoute("/");
  const [isOnStudents] = useRoute("/students");
  const [isOnReports] = useRoute("/reports");
  const [isOnSettings] = useRoute("/settings");

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-dark">
        <div className="flex items-center justify-center h-16 bg-gray-900">
          <span className="text-white font-semibold text-lg">EduWatch</span>
        </div>
        <div className="flex flex-col flex-grow px-4 mt-5">
          <nav className="flex-1 space-y-2">
            <Link href="/">
              <a className={cn(
                "flex items-center px-4 py-3 rounded-md group", 
                isOnDashboard 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                <BarChart3 className="h-6 w-6 mr-3" />
                Dashboard
              </a>
            </Link>
            <Link href="/students">
              <a className={cn(
                "flex items-center px-4 py-3 rounded-md group", 
                isOnStudents 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                <Users className="h-6 w-6 mr-3" />
                Students
              </a>
            </Link>
            <Link href="/reports">
              <a className={cn(
                "flex items-center px-4 py-3 rounded-md group", 
                isOnReports 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                <FileText className="h-6 w-6 mr-3" />
                Reports
              </a>
            </Link>
            <Link href="/settings">
              <a className={cn(
                "flex items-center px-4 py-3 rounded-md group", 
                isOnSettings 
                  ? "text-white bg-gray-700" 
                  : "text-gray-300 hover:bg-gray-700"
              )}>
                <Settings className="h-6 w-6 mr-3" />
                Settings
              </a>
            </Link>
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">Prof. Jane Doe</p>
                <p className="text-xs font-medium text-gray-300">Computer Science</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
