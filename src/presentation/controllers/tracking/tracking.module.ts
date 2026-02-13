import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.controller';
import { TrackingService } from '../../../core/application/services/tracking/tracking.service';
import { CarWash } from '../../../core/domain/entities/car-wash.entity';
import { Review } from '../../../core/domain/entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarWash, Review])],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
