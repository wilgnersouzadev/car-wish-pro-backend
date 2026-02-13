import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { ConfigService } from "@nestjs/config";
import twilio from "twilio";
import {
  Notification,
  NotificationType,
  NotificationStatus,
  NotificationTemplateType,
} from "src/core/domain/entities/notification.entity";
import { Customer } from "src/core/domain/entities/customer.entity";
import { CarWash } from "src/core/domain/entities/car-wash.entity";

export interface SendNotificationDTO {
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

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private twilioClient: twilio.Twilio;
  private twilioPhoneNumber: string;

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private configService: ConfigService,
  ) {
    const accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID");
    const authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN");
    this.twilioPhoneNumber = this.configService.get<string>("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !this.twilioPhoneNumber) {
      this.logger.warn("Twilio credentials not configured. Notifications will be disabled.");
    } else {
      this.twilioClient = twilio(accountSid, authToken);
      this.logger.log("Twilio client initialized successfully");
    }
  }

  private validatePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }

    if (!cleaned.startsWith("55")) {
      cleaned = "55" + cleaned;
    }

    if (!cleaned.startsWith("+")) {
      cleaned = "+" + cleaned;
    }

    const phoneRegex = /^\+55\d{10,11}$/;
    if (!phoneRegex.test(cleaned)) {
      throw new BadRequestException(
        `Número de telefone inválido: ${phone}. Formato esperado: +55XXXXXXXXXXX`,
      );
    }

    return cleaned;
  }

  private getMessageTemplate(
    templateType: NotificationTemplateType,
    customMessage?: string,
    washDetails?: any,
  ): string {
    switch (templateType) {
      case NotificationTemplateType.WASH_COMPLETED:
        return `🚗 Car Wish - Lavagem Concluída! ✨\n\nOlá! Sua ${washDetails?.serviceType || "lavagem"} no ${washDetails?.vehicleModel || "veículo"} foi concluída.\nValor: R$ ${washDetails?.amount || "0.00"}\n\nObrigado pela preferência! 😊`;

      case NotificationTemplateType.REMINDER:
        return `🚗 Car Wish - Lembrete 📅\n\nOlá! Faz um tempo que não vemos você por aqui.\nQue tal agendar uma lavagem? Estamos com promoções especiais para clientes frequentes!\n\nAguardamos seu retorno! 🙌`;

      case NotificationTemplateType.APPOINTMENT_CONFIRMED:
        return `🚗 Car Wish - Agendamento Confirmado ✅\n\nSeu agendamento foi confirmado!\nVeículo: ${washDetails?.vehicleModel || "N/A"}\nServiço: ${washDetails?.serviceType || "N/A"}\n\nNos vemos em breve! 😊`;

      case NotificationTemplateType.CUSTOM:
        return customMessage || "Mensagem personalizada do Car Wish";

      default:
        return customMessage || "Notificação do Car Wish";
    }
  }

  async sendWhatsApp(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    if (!this.twilioClient) {
      return { success: false, error: "Twilio não configurado" };
    }

    try {
      const validatedPhone = this.validatePhoneNumber(to);
      const whatsappNumber = `whatsapp:${validatedPhone}`;

      this.logger.log(`Sending WhatsApp to ${whatsappNumber}`);

      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: `whatsapp:${this.twilioPhoneNumber}`,
        to: whatsappNumber,
      });

      this.logger.log(`WhatsApp sent successfully. SID: ${twilioMessage.sid}`);
      return { success: true, messageSid: twilioMessage.sid };
    } catch (error) {
      this.logger.error(`Error sending WhatsApp: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async sendSMS(
    to: string,
    message: string,
  ): Promise<{ success: boolean; messageSid?: string; error?: string }> {
    if (!this.twilioClient) {
      return { success: false, error: "Twilio não configurado" };
    }

    try {
      const validatedPhone = this.validatePhoneNumber(to);

      this.logger.log(`Sending SMS to ${validatedPhone}`);

      const twilioMessage = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: validatedPhone,
      });

      this.logger.log(`SMS sent successfully. SID: ${twilioMessage.sid}`);
      return { success: true, messageSid: twilioMessage.sid };
    } catch (error) {
      this.logger.error(`Error sending SMS: ${error.message}`, error.stack);
      return { success: false, error: error.message };
    }
  }

  async sendNotification(
    dto: SendNotificationDTO,
    shopId: number,
  ): Promise<Notification> {
    const customer = await this.customerRepository.findOne({
      where: { id: dto.customerId, shopId },
    });

    if (!customer) {
      throw new BadRequestException("Cliente não encontrado");
    }

    const message = this.getMessageTemplate(
      dto.templateType,
      dto.customMessage,
      dto.washDetails,
    );

    const notification = this.notificationRepository.create({
      customerId: dto.customerId,
      shopId,
      type: dto.type,
      status: NotificationStatus.PENDING,
      templateType: dto.templateType,
      message,
      recipientPhone: customer.phone,
    });

    await this.notificationRepository.save(notification);

    let result: { success: boolean; messageSid?: string; error?: string };

    if (dto.type === NotificationType.WHATSAPP) {
      result = await this.sendWhatsApp(customer.phone, message);
    } else {
      result = await this.sendSMS(customer.phone, message);
    }

    notification.status = result.success
      ? NotificationStatus.SENT
      : NotificationStatus.FAILED;
    notification.sentAt = result.success ? new Date() : null;
    notification.errorMessage = result.error;
    notification.twilioMessageSid = result.messageSid;

    await this.notificationRepository.save(notification);

    return notification;
  }

  async sendWashCompletedNotification(
    carWash: CarWash,
    type: NotificationType = NotificationType.WHATSAPP,
  ): Promise<Notification> {
    return this.sendNotification(
      {
        customerId: carWash.customerId,
        type,
        templateType: NotificationTemplateType.WASH_COMPLETED,
        washDetails: {
          serviceType: this.translateServiceType(carWash.serviceType),
          amount: Number(carWash.amount),
          vehicleModel: carWash.vehicle?.model || "veículo",
        },
      },
      carWash.shopId,
    );
  }

  private translateServiceType(serviceType: string): string {
    const translations: Record<string, string> = {
      basic: "Lavagem Básica",
      full: "Lavagem Completa",
      polish: "Polimento",
    };
    return translations[serviceType] || serviceType;
  }

  async getHistory(
    shopId: number,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      type?: NotificationType;
      status?: NotificationStatus;
      customerId?: number;
    },
  ): Promise<Notification[]> {
    const where: any = { shopId };

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate && filters?.endDate) {
      where.sentAt = Between(filters.startDate, filters.endDate);
    }

    return this.notificationRepository.find({
      where,
      relations: ["customer"],
      order: { createdAt: "DESC" },
    });
  }

  async getNotificationById(id: number, shopId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id, shopId },
      relations: ["customer"],
    });

    if (!notification) {
      throw new BadRequestException("Notificação não encontrada");
    }

    return notification;
  }

  async getStatistics(shopId: number, days: number = 30): Promise<{
    total: number;
    sent: number;
    failed: number;
    byType: Record<string, number>;
    byTemplateType: Record<string, number>;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const notifications = await this.notificationRepository.find({
      where: {
        shopId,
        createdAt: Between(startDate, endDate),
      },
    });

    const stats = {
      total: notifications.length,
      sent: notifications.filter((n) => n.status === NotificationStatus.SENT).length,
      failed: notifications.filter((n) => n.status === NotificationStatus.FAILED).length,
      byType: {} as Record<string, number>,
      byTemplateType: {} as Record<string, number>,
    };

    notifications.forEach((n) => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byTemplateType[n.templateType] = (stats.byTemplateType[n.templateType] || 0) + 1;
    });

    return stats;
  }
}
