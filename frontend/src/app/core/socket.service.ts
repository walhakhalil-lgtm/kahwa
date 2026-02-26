import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private readonly socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
    this.socket.emit('match:join', { matchId: 'demo-match-1' });
  }

  on(event: string, callback: (payload: any) => void): void {
    this.socket.on(event, callback);
  }
}
