import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { NotificationService } from "src/core/application/services/notification/notification.service";
import { JwtAuthGuard } from "src/core/application/guards/jwt-auth.guard";
import { TenantGuard } from "src/core/application/guards/tenant.guard";
import { ShopId } from "src/core/application/decorators/shop-id.decorator";
import {
  NotificationType,
  NotificationStatus,
  NotificationTemplateType,
} from "src/core/domain/entities/notification.entity";

class SendNotificationDTO {
  customerId: number;
  type: NotificationType;
  templateType: NotificationTemplateType;
  customMessage?: string;
  washDetails?: {
    serviceType: string;
    amount: number;
    vehicleModel: string;
  };
}

class GetHistoryDTO {
  startDate?: string;
  endDate?: string;
  type?: NotificationType;
  status?: NotificationStatus;
  customerId?: number;
}

@Controller("notifications")
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post("send")
  async sendNotification(
    @Body() dto: SendNotificationDTO,
    @ShopId() shopId: number,
  ) {
    const notification = await this.notificationService.sendNotification(dto, shopId);
    return {
      success: true,
      data: notification,
      message: "Notificação enviada com sucesso",
    };
  }

  @Get("history")
  async getHistory(
    @Query() query: GetHistoryDTO,
    @ShopId() shopId: number,
  ) {
    const filters: any = {};

    if (query.startDate) {
      filters.startDate = new Date(query.startDate);
    }

    if (query.endDate) {
      filters.endDate = new Date(query.endDate);
    }

    if (query.type) {
      filters.type = query.type;
    }

    if (query.status) {
      filters.status = query.status;
    }

    if (query.customerId) {
      filters.customerId = Number(query.customerId);
    }

    const notifications = await this.notificationService.getHistory(shopId, filters);

    return {
      success: true,
      data: notifications,
      total: notifications.length,
    };
  }

  @Get("statistics")
  async getStatistics(
    @Query("days") days: string = "30",
    @ShopId() shopId: number,
  ) {
    const stats = await this.notificationService.getStatistics(
      shopId,
      parseInt(days, 10),
    );

    return {
      success: true,
      data: stats,
    };
  }

  @Get("templates")
  async getTemplates() {
    return {
      success: true,
      data: {
        templates: [
          {
            id: NotificationTemplateType.WASH_COMPLETED,
            name: "Lavagem Concluída",
            description: "Notifica o cliente quando a lavagem é concluída",
            preview:
              "🚗 Car Wish - Lavagem Concluída! ✨\n\nOlá! Sua lavagem foi concluída.\nObrigado pela preferência! 😊",
          },
          {
            id: NotificationTemplateType.REMINDER,
            name: "Lembrete de Retorno",
            description: "Lembra clientes frequentes de retornar",
            preview:
              "🚗 Car Wish - Lembrete 📅\n\nOlá! Faz um tempo que não vemos você por aqui.\nQue tal agendar uma lavagem?",
          },
          {
            id: NotificationTemplateType.APPOINTMENT_CONFIRMED,
            name: "Agendamento Confirmado",
            description: "Confirma o agendamento do cliente",
            preview:
              "🚗 Car Wish - Agendamento Confirmado ✅\n\nSeu agendamento foi confirmado!\nNos vemos em breve! 😊",
          },
          {
            id: NotificationTemplateType.CUSTOM,
            name: "Mensagem Personalizada",
            description: "Envie uma mensagem personalizada",
            preview: "Sua mensagem personalizada aqui...",
          },
        ],
      },
    };
  }

  @Get(":id")
  async getNotification(
    @Param("id", ParseIntPipe) id: number,
    @ShopId() shopId: number,
  ) {
    const notification = await this.notificationService.getNotificationById(id, shopId);

    return {
      success: true,
      data: notification,
    };
  }

  @Post("test")
  async testNotification(
    @Body() body: { phone: string; type: NotificationType; message: string },
    @ShopId() shopId: number,
  ) {
    let result;

    if (body.type === NotificationType.WHATSAPP) {
      result = await this.notificationService.sendWhatsApp(body.phone, body.message);
    } else {
      result = await this.notificationService.sendSMS(body.phone, body.message);
    }

    return {
      success: result.success,
      data: result,
      message: result.success
        ? "Mensagem de teste enviada com sucesso"
        : "Falha ao enviar mensagem de teste",
    };
  }
}
