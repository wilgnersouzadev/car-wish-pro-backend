import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Customer } from "./customer.entity";
import { Shop } from "./shop.entity";

export enum NotificationType {
  SMS = "sms",
  WHATSAPP = "whatsapp",
}

export enum NotificationStatus {
  SENT = "sent",
  FAILED = "failed",
  PENDING = "pending",
}

export enum NotificationTemplateType {
  WASH_COMPLETED = "wash_completed",
  REMINDER = "reminder",
  APPOINTMENT_CONFIRMED = "appointment_confirmed",
  CUSTOM = "custom",
}

@Entity("notifications")
export class Notification extends BaseEntity {
  @Column()
  customerId: number;

  @Column()
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({
    type: "enum",
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Column({
    type: "enum",
    enum: NotificationTemplateType,
  })
  templateType: NotificationTemplateType;

  @Column({ type: "text" })
  message: string;

  @Column({ length: 20 })
  recipientPhone: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt?: Date;

  @Column({ type: "text", nullable: true })
  errorMessage?: string;

  @Column({ type: "text", nullable: true })
  twilioMessageSid?: string;
}
