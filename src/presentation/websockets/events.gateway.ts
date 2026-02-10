import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EventsService } from 'src/core/application/services/events/events.service';

interface AuthenticatedSocket extends Socket {
  userId: number;
  shopId: number;
  role: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private eventsService: EventsService,
  ) {}

  afterInit(server: Server) {
    this.eventsService.setServer(server);
    this.logger.log('WebSocket Gateway initialized on /ws namespace');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractTokenFromHandshake(client);

      if (!token) {
        throw new UnauthorizedException('Token não fornecido');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.userId = payload.sub;
      client.shopId = payload.shopId;
      client.role = payload.role;

      const room = `shop:${client.shopId}`;
      await client.join(room);

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.userId}, Shop: ${client.shopId}, Room: ${room})`,
      );

      client.emit('connected', {
        message: 'Conectado ao servidor WebSocket',
        shopId: client.shopId,
      });
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.emit('error', { message: 'Autenticação falhou' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id} (User: ${client.userId})`);
  }

  @SubscribeMessage('ping')
  handlePing(client: AuthenticatedSocket) {
    return { event: 'pong', data: { timestamp: new Date() } };
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader) {
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer' ? token : null;
    }

    const tokenFromQuery = client.handshake.auth?.token;
    if (tokenFromQuery) {
      return tokenFromQuery;
    }

    return null;
  }
}
