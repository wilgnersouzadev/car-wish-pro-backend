import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatioController } from './patio.controller';
import { PatioService } from '../../../core/application/services/patio/patio.service';
import { CarWash } from '../../../core/domain/entities/car-wash.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarWash])],
  controllers: [PatioController],
  providers: [PatioService],
  exports: [PatioService],
})
export class PatioModule {}
