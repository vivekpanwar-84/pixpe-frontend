"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House as Home, MapPin, Camera, DollarSign, User, Bell, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { useAuthContext } from "@/providers/AuthContext";

export default function SurveyorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [notifications] = useState(3);
  const { user, logout } = useAuthContext();

  const navItems = [
    { path: "/surveyor", icon: Home, label: "Home" },
    { path: "/surveyor/aoi", icon: MapPin, label: "AOIs" },
    { path: "/surveyor/aoi-map", icon: MapPin, label: "AOIs Map" },
    { path: "/surveyor/earnings", icon: DollarSign, label: "Earnings" },
    { path: "/surveyor/profile", icon: User, label: "Profile" },
  ];

  const isActive = (path: string) => {
    if (path === "/surveyor") {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  const userInitials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : "U";

  return (
    <AuthGuard>
      <RoleGuard allowedRoles={["SURVEYOR"]}>
        <div className="min-h-screen bg-gray-50 pb-16 lg:pb-0">
          {/* Mobile/Tablet Header */}
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
                    <div className="py-4">
                      <h3 className="font-semibold mb-4">Menu</h3>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {notifications}
                  </Badge>
                )}
              </Button>
            </div>
          </header>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
            <div className="p-6">
              <h1 className="text-xl font-bold text-blue-600">Pixpe</h1>
              <p className="text-sm text-gray-500">Surveyor Dashboard</p>
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
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">
                  {navItems.find((item) => isActive(item.path))?.label || "Dashboard"}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
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

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
            <div className="flex items-center justify-around h-16">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-0 flex-1 ${isActive(item.path)
                    ? "text-blue-600"
                    : "text-gray-500"
                    }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
