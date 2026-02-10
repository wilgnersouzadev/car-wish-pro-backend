import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsController } from "./notifications.controller";
import { NotificationService } from "src/core/application/services/notification/notification.service";
import { Notification } from "src/core/domain/entities/notification.entity";
import { Customer } from "src/core/domain/entities/customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Notification, Customer])],
  controllers: [NotificationsController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationsModule {}
