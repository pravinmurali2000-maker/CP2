import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Standing } from 'src/tournaments/services/standings.service';
import { Notification } from 'src/database/entities/notification.entity';
import { Tournament } from 'src/database/entities/tournament.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict this to your frontend's URL
  },
})
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket Gateway Initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_tournament_room')
  handleJoinRoom(client: Socket, tournamentId: string): void {
    client.join(`tournament-${tournamentId}`);
    client.emit('joined_room', `You are now listening for updates on tournament ${tournamentId}`);
  }

  @SubscribeMessage('leave_tournament_room')
  handleLeaveRoom(client: Socket, tournamentId: string): void {
    client.leave(`tournament-${tournamentId}`);
  }

  /**
   * Broadcasts the updated standings to all clients in a specific tournament room.
   * @param tournamentId The ID of the tournament.
   * @param standings The newly calculated standings data.
   */
  broadcastScoreUpdate(tournamentId: number, standings: Standing[]): void {
    this.server.to(`tournament-${tournamentId}`).emit('match_score_updated', standings);
  }

  /**
   * Broadcasts a new notification to all clients in a specific tournament room.
   * @param tournamentId The ID of the tournament.
   * @param notification The notification object to be sent.
   */
  broadcastNotification(tournamentId: number, notification: Notification): void {
    this.server.to(`tournament-${tournamentId}`).emit('notification_sent', notification);
  }

  /**
   * Broadcasts the entire updated tournament object.
   * @param tournamentId The ID of the tournament.
   * @param tournament The full tournament object.
   */
  broadcastTournamentUpdate(tournamentId: number, tournament: Tournament): void {
    this.server.to(`tournament-${tournamentId}`).emit('tournament_updated', tournament);
  }
}
