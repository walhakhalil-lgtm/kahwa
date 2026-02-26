import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchEvent, MatchState } from '../common/types';

@WebSocketGateway({ cors: { origin: '*' } })
export class MatchGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket): void {
    client.emit('system:connected', { ok: true });
  }

  @SubscribeMessage('match:join')
  joinMatch(@ConnectedSocket() client: Socket, @MessageBody() payload: { matchId: string }): void {
    client.join(`match:${payload.matchId}`);
    client.emit('match:joined', { room: `match:${payload.matchId}` });
  }

  emitTimerUpdate(matchId: string, match: MatchState): void {
    this.server.to(`match:${matchId}`).emit('timer:update', {
      clock: match.clock
    });
  }

  emitScoreUpdate(matchId: string, match: MatchState): void {
    this.server.to(`match:${matchId}`).emit('score:update', {
      score: {
        A: match.teams.A.score,
        B: match.teams.B.score
      }
    });
  }

  emitMatchEvent(matchId: string, event: MatchEvent): void {
    this.server.to(`match:${matchId}`).emit('match:event:new', event);
  }

  emitOverlayCommand(matchId: string, command: Record<string, unknown>): void {
    this.server.to(`match:${matchId}`).emit('overlay:command', command);
  }
}
