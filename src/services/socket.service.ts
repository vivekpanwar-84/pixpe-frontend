import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        if (this.socket) return this.socket;

        console.log(`Attempting to connect to socket at ${API_URL}/notifications for user ${userId}`);

        this.socket = io(`${API_URL}/notifications`, {
            query: { userId },
            transports: ['websocket', 'polling'],
            autoConnect: true,
            reconnection: true,
        });

        this.socket.on('connect', () => {
            console.log('Connected to Notifications Gateway successfully');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Socket Connection Error:', error);
        });

        this.socket.on('connection_success', (data) => {
            console.log('Server confirmed room joining:', data);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected from Notifications Gateway. Reason:', reason);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    onNotification(callback: (notification: any) => void) {
        if (!this.socket) return;
        this.socket.on('notification', callback);
    }

    offNotification() {
        if (!this.socket) return;
        this.socket.off('notification');
    }
}

export const socketService = new SocketService();
