import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarWash, WashStatus, PaymentStatus } from '../../../domain/entities/car-wash.entity';
import { Review } from '../../../domain/entities/review.entity';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(CarWash)
    private readonly carWashRepository: Repository<CarWash>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getByTrackingToken(token: string) {
    const carWash = await this.carWashRepository.findOne({
      where: { trackingToken: token },
      relations: ['vehicle', 'customer', 'shop', 'employees'],
    });

    if (!carWash) {
      throw new NotFoundException('Lavagem não encontrada');
    }

    const progressMap = {
      [WashStatus.WAITING]: 0,
      [WashStatus.IN_PROGRESS]: 50,
      [WashStatus.COMPLETED]: 75,
      [WashStatus.READY_PICKUP]: 90,
      [WashStatus.DELIVERED]: 100,
    };

    const progress = progressMap[carWash.washStatus] || 0;

    let estimatedTimeMinutes = 0;
    if (carWash.washStatus === WashStatus.WAITING) {
      estimatedTimeMinutes = 30;
    } else if (carWash.washStatus === WashStatus.IN_PROGRESS) {
      estimatedTimeMinutes = 20;
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { carWashId: carWash.id },
    });

    return {
      id: carWash.id,
      trackingToken: carWash.trackingToken,
      status: carWash.washStatus,
      progress,
      estimatedTimeMinutes,
      vehicle: {
        licensePlate: carWash.vehicle.licensePlate,
        model: carWash.vehicle.model,
        color: carWash.vehicle.color,
        type: carWash.vehicle.type,
      },
      customer: {
        id: carWash.customer.id,
        name: carWash.customer.name,
        phone: carWash.customer.phone,
      },
      shop: {
        name: carWash.shop.name,
      },
      service: {
        type: carWash.serviceType,
        amount: carWash.amount,
      },
      photosBefore: carWash.photosBefore || [],
      photosAfter: carWash.photosAfter || [],
      dateTime: carWash.dateTime,
      startedAt: carWash.startedAt,
      completedAt: carWash.completedAt,
      paymentStatus: carWash.paymentStatus,
      hasReview: !!existingReview,
    };
  }

  async updateStatus(
    token: string,
    status: WashStatus,
  ): Promise<{ success: boolean; message: string }> {
    const carWash = await this.carWashRepository.findOne({
      where: { trackingToken: token },
      relations: ['vehicle', 'customer'],
    });

    if (!carWash) {
      throw new NotFoundException('Lavagem não encontrada');
    }

    const previousStatus = carWash.washStatus;
    carWash.washStatus = status;

    if (status === WashStatus.IN_PROGRESS && !carWash.startedAt) {
      carWash.startedAt = new Date();
    }

    if (
      (status === WashStatus.COMPLETED || status === WashStatus.READY_PICKUP) &&
      !carWash.completedAt
    ) {
      carWash.completedAt = new Date();
    }

    if (status === WashStatus.DELIVERED) {
      carWash.paymentStatus = PaymentStatus.PAID;
    }

    await this.carWashRepository.save(carWash);

    if (previousStatus !== status) {
      let estimatedTime: number | undefined;
      if (status === WashStatus.WAITING) {
        estimatedTime = 30;
      } else if (status === WashStatus.IN_PROGRESS) {
        estimatedTime = 20;
      }

      if (status === WashStatus.READY_PICKUP) {
       
      }

      if (status === WashStatus.DELIVERED) {
        setTimeout(() => {
          
        }, 60000);
      }
    }

    return {
      success: true,
      message: 'Status atualizado com sucesso',
    };
  }
}
