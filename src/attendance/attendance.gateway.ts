import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class AttendanceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('FE connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('FE disconnected:', client.id);
  }

  // 🔥 HÀM BẮN REALTIME
  emitAttendance(data: {
    userCode: string;
    fingerprintId: number;
    deviceId: string;
    time: Date;
  }) {
    this.server.emit('attendance', data);
  }

  emitFingerprint(data: { fingerprintId: number; userCode: string }) {
    this.server.emit('fingerprint', data);
  }
}
