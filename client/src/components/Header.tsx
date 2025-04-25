import { Button } from "@/components/ui/button";
import { Upload, Menu, Bell } from "lucide-react";

type HeaderProps = {
  studentCount: number;
};

export function Header({ studentCount }: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button className="md:hidden px-4 text-gray-500 focus:outline-none">
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <span className="md:hidden font-semibold text-lg text-gray-900">EduWatch</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Button className="flex items-center gap-2 bg-primary hover:bg-indigo-700">
                <Upload className="h-5 w-5" />
                Share Session
              </Button>
            </div>
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <Bell className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
