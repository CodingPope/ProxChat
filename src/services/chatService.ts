import { EventEmitter } from 'events';

interface ChatRoom {
    id: string;
    name: string;
    users: string[];
    messages: string[];
}

class ChatService {
    private chatRooms: ChatRoom[] = [];
    private eventEmitter: EventEmitter = new EventEmitter();

    createChatRoom(name: string): ChatRoom {
        const newRoom: ChatRoom = {
            id: this.generateRoomId(),
            name,
            users: [],
            messages: []
        };
        this.chatRooms.push(newRoom);
        this.eventEmitter.emit('roomCreated', newRoom);
        return newRoom;
    }

    joinChatRoom(roomId: string, userId: string): void {
        const room = this.chatRooms.find(room => room.id === roomId);
        if (room && !room.users.includes(userId)) {
            room.users.push(userId);
            this.eventEmitter.emit('userJoined', roomId, userId);
        }
    }

    leaveChatRoom(roomId: string, userId: string): void {
        const room = this.chatRooms.find(room => room.id === roomId);
        if (room) {
            room.users = room.users.filter(user => user !== userId);
            this.eventEmitter.emit('userLeft', roomId, userId);
        }
    }

    sendMessage(roomId: string, userId: string, message: string): void {
        const room = this.chatRooms.find(room => room.id === roomId);
        if (room) {
            room.messages.push(`${userId}: ${message}`);
            this.eventEmitter.emit('messageSent', roomId, message);
        }
    }

    on(event: string, listener: (...args: any[]) => void): void {
        this.eventEmitter.on(event, listener);
    }

    private generateRoomId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export default new ChatService();