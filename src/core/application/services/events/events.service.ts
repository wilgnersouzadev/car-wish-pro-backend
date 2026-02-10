import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export interface WebSocketEvent {
  event: string;
  data: any;
}

@Injectable()
export class EventsService {
  private server: Server;
  private readonly logger = new Logger(EventsService.name);

  setServer(server: Server) {
    this.server = server;
    this.logger.log('WebSocket server registered in EventsService');
  }

  emitToShop(shopId: number, event: string, data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    const room = `shop:${shopId}`;
    this.server.to(room).emit(event, data);

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Event emitted to ${room}: ${event}`, data);
    }
  }

  emitToAll(event: string, data: any) {
    if (!this.server) {
      this.logger.warn('WebSocket server not initialized');
      return;
    }

    this.server.emit(event, data);

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Event emitted to all: ${event}`, data);
    }
  }
}
