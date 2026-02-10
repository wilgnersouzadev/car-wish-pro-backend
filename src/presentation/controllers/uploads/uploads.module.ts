import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { StorageService } from 'src/core/application/services/storage/storage.service';
import { CarWashService } from 'src/core/application/services/washing/washing.service';
import { ShopService } from 'src/core/application/services/shop/shop.service';
import { EventsService } from 'src/core/application/services/events/events.service';
import { CarWash } from 'src/core/domain/entities/car-wash.entity';
import { Shop } from 'src/core/domain/entities/shop.entity';
import { Vehicle } from 'src/core/domain/entities/vehicle.entity';
import { Customer } from 'src/core/domain/entities/customer.entity';
import { User } from 'src/core/domain/entities/user.entity';
import { Notification } from 'src/core/domain/entities/notification.entity';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarWash, Shop, Vehicle, Customer, User, Notification]),
    forwardRef(() => LoyaltyModule),
  ],
  controllers: [UploadsController],
  providers: [
    StorageService,
    CarWashService,
    ShopService,
    EventsService,
  ],
  exports: [StorageService],
})
export class UploadsModule {}
