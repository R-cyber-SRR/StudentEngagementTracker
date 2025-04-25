import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

type DashboardLayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  studentCount: number;
};

export function DashboardLayout({ children, title, subtitle, studentCount }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header studentCount={studentCount} />
        
        <main className="flex-1 overflow-x-hidden">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold leading-tight text-gray-900">{title}</h1>
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-500">
                      {subtitle}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                  <div className="flex items-center">
                    <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                      <span className="inline-block h-3 w-3 rounded-full bg-secondary"></span>
                      <span className="ml-2 text-sm font-medium text-gray-900">Live: {studentCount} students connected</span>
                    </div>
                    <button type="button" className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                      <span>Session History</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
