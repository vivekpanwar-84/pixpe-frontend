import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, MailOpen } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { socketService } from '@/services/socket.service';
import { notificationService } from '@/services/notification.service';
import { useAuthContext } from '@/providers/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
    const { user } = useAuthContext();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!user?.id) return;

        console.log(`[NotificationBell] Initializing for user: ${user.id}`);

        // Connect socket
        socketService.connect(user.id);

        // Listen for real-time notifications
        socketService.onNotification((notification) => {
            console.log('[NotificationBell] Received real-time notification:', notification);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
            toast.info(notification.title, {
                description: notification.message,
            });
        });

        // Fetch initial notifications
        fetchNotifications();

        return () => {
            console.log('[NotificationBell] Cleaning up');
            socketService.offNotification();
        };
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getMyNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n: any) => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -right-1 -top-1 px-1.5 h-4 min-w-[16px] flex items-center justify-center text-[10px]"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
                <DropdownMenuLabel className="p-4 flex items-center justify-between">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-[10px] text-muted-foreground font-normal">{unreadCount} unread</span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-80">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground italic">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex flex-col items-start p-4 cursor-default border-b last:border-0 ${!notification.is_read ? 'bg-blue-50/50' : ''
                                    }`}
                            >
                                <div className="flex justify-between w-full items-start gap-2">
                                    <span className={`font-semibold text-xs ${!notification.is_read ? 'text-blue-700' : ''}`}>
                                        {notification.title}
                                    </span>
                                    <div className="flex gap-1 items-center">
                                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                        {!notification.is_read && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-4 w-4 text-blue-600 hover:text-blue-800"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                            >
                                                <MailOpen className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-[11px] leading-tight text-gray-600 mt-1">
                                    {notification.message}
                                </p>
                                {notification.is_read && (
                                    <div className="flex items-center gap-1 mt-1.5 self-end opacity-40">
                                        <Check className="h-2 w-2" />
                                        <span className="text-[8px] uppercase tracking-tighter">Seen</span>
                                    </div>
                                )}
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
                <div className="p-2 border-t text-center">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] h-8 text-muted-foreground">
                        View All Notifications (Coming Soon)
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
