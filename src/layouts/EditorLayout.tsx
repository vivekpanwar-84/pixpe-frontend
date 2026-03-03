"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Image as ImageIcon, RefreshCw, Bell, Menu, User, LogOut, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthContext } from "@/providers/AuthContext";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();

  const navItems = [
    { path: "/editor", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/editor/aoi", icon: MapPin, label: "AOI Review" },
    { path: "/editor/assigned-photos", icon: ImageIcon, label: "Assigned Photos" },
    // { path: "/editor/review", icon: ImageIcon, label: "Photo Review" },
    { path: "/editor/form-review", icon: FileText, label: "Form Review" },
    { path: "/editor/rework", icon: RefreshCw, label: "Rework Queue" },
  ];

  const isActive = (path: string) => {
    if (path === "/editor") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "ED";

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["EDITOR"]}>
        <div className="min-h-screen bg-gray-50">
          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetTitle className="sr-only">Editor Menu</SheetTitle>
                    <div className="py-4">
                      <h3 className="font-semibold mb-4">Editor Menu</h3>
                      <nav className="space-y-1">
                        {navItems.map((item) => (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive(item.path)
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-100"
                              }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 mt-4"
                          onClick={() => logout()}
                        >
                          <LogOut className="w-5 h-5 mr-3" />
                          Sign Out
                        </Button>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
                <h1 className="font-semibold text-lg">Pixpe</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">5</Badge>
                </Button>
              </div>
            </div>
          </header>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
            <div className="p-6">
              <h1 className="text-xl font-bold text-blue-600">Pixpe</h1>
              <p className="text-sm text-gray-500">Editor Dashboard</p>
            </div>

            <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-3 mt-auto border-t border-gray-100">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => logout()}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </aside>

          {/* Desktop Header */}
          <header className="hidden lg:block fixed top-0 left-64 right-0 bg-white border-b border-gray-200 z-30">
            <div className="flex items-center justify-between px-6 h-16">
              <h2 className="text-lg font-semibold">
                {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
              </h2>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">5</Badge>
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {userInitials}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-14 lg:pt-16 lg:pl-64">
            {children}
          </main>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
