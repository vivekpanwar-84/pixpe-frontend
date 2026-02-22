"use client";
import { useState } from "react";
import { Plus, Search, Filter, EllipsisVertical as MoreVertical, Pencil as Edit, Trash2, Lock, Eye, EyeOff, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["Manager", "Editor", "Surveyor"], {
    message: "Please select a role",
  }),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserManagement() {
  const { useAllUsers, createUser } = useAdmin();
  const { data: users, isLoading, isError } = useAllUsers();

  const [roleFilter, setRoleFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
    },
  });

  const selectedRole = watch("role");
  const [statusConfirmUser, setStatusConfirmUser] = useState<any>(null);
  const { updateUserStatus } = useAdmin();

  const getRoleSlug = (user: any): string => {
    const role = user?.role;
    if (!role) return "";
    const slug = typeof role === "string" ? role : role.slug;
    return String(slug || "").toLowerCase();
  };

  const filteredUsers = (users || []).filter((user: any) => {
    const userRole = getRoleSlug(user);
    const userName = user?.name || "";
    const userEmail = user?.email || "";

    const matchesRole = roleFilter === "all" || userRole.toLowerCase() === roleFilter.toLowerCase();
    const matchesSearch = userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const handleAddUser = (data: UserFormData) => {
    // Map role to lowercase for backend
    const payload = {
      ...data,
      role: data.role.toLowerCase()
    };

    createUser.mutate(payload, {
      onSuccess: () => {
        toast.success("User created successfully");
        setIsAddUserOpen(false);
        reset();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create user");
      }
    });
  };

  const handleToggleStatus = () => {
    if (!statusConfirmUser) return;

    updateUserStatus.mutate(
      { id: statusConfirmUser.id, isActive: !statusConfirmUser.is_active },
      {
        onSuccess: () => {
          toast.success(`User ${!statusConfirmUser.is_active ? 'activated' : 'deactivated'} successfully`);
          setStatusConfirmUser(null);
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || "Failed to update status");
        },
      }
    );
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">User Management</h1>
          <p className="text-gray-600">Manage system users and roles</p>
        </div>
        <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new account with specific role access.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddUser)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={selectedRole} onValueChange={(val) => setValue("role", val as any, { shouldValidate: true })}>
                    <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Editor">Editor</SelectItem>
                      <SelectItem value="Surveyor">Surveyor</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => { setIsAddUserOpen(false); reset(); }}>Cancel</Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? "Creating..." : "Create Account"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search users..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="surveyor">Surveyor</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mobile: Card View */}
      <div className="space-y-3 lg:hidden">
        {isLoading ? (
          [1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No users found.</p>
        ) : (
          filteredUsers.map((user: any) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={user.is_active !== false ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
                    onClick={() => setStatusConfirmUser(user)}
                  >
                    <Power className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{getRoleSlug(user)}</Badge>
                  <Badge variant={user.is_active !== false ? "default" : "outline"}>
                    {user.is_active !== false ? "active" : "inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop: Table View */}
      <Card className="hidden lg:block">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Name</th>
                <th className="text-left py-3 px-4 font-medium text-sm text-gray-600">Email</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Role</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Status</th>
                <th className="text-center py-3 px-4 font-medium text-sm text-gray-600">Activity</th>
                <th className="text-right py-3 px-4 font-medium text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4"><Skeleton className="h-32 w-full" /></td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{user.name}</td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant="secondary" className="capitalize">{getRoleSlug(user)}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={user.is_active !== false ? "default" : "outline"}>
                        {user.is_active !== false ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      {getRoleSlug(user).toLowerCase() === "surveyor" && `${user.surveys || 0} surveys`}
                      {getRoleSlug(user).toLowerCase() === "editor" && `${user.reviews || 0} reviews`}
                      {getRoleSlug(user).toLowerCase() === "manager" && `${user.managed || 0} managed`}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={user.is_active !== false ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
                        onClick={() => setStatusConfirmUser(user)}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {user.is_active !== false ? "" : ""}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!statusConfirmUser} onOpenChange={(open) => !open && setStatusConfirmUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to {statusConfirmUser?.is_active !== false ? "deactivate" : "activate"} user <strong>{statusConfirmUser?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusConfirmUser(null)}>Cancel</Button>
            <Button
              variant={statusConfirmUser?.is_active !== false ? "destructive" : "default"}
              onClick={handleToggleStatus}
              disabled={updateUserStatus.isPending}
            >
              {updateUserStatus.isPending ? "Updating..." : (statusConfirmUser?.is_active !== false ? "Deactivate" : "Activate")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
