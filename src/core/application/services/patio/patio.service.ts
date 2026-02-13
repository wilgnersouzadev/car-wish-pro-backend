import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CarWash, WashStatus } from '../../../domain/entities/car-wash.entity';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class PatioService {
  constructor(
    @InjectRepository(CarWash)
    private readonly carWashRepository: Repository<CarWash>,
  ) {}

  async getBoard(shopId: number) {
    const today = new Date();
    const startDate = startOfDay(today);
    const endDate = endOfDay(today);

    const carWashes = await this.carWashRepository.find({
      where: {
        shopId,
        dateTime: Between(startDate, endDate),
      },
      relations: ['vehicle', 'customer', 'employees'],
      order: {
        dateTime: 'ASC',
      },
    });

    const activeWashes = carWashes.filter(
      (wash) => wash.washStatus !== WashStatus.DELIVERED,
    );

    const waiting = activeWashes.filter(
      (wash) => wash.washStatus === WashStatus.WAITING,
    );
    const inProgress = activeWashes.filter(
      (wash) => wash.washStatus === WashStatus.IN_PROGRESS,
    );
    const ready = activeWashes.filter(
      (wash) =>
        wash.washStatus === WashStatus.COMPLETED ||
        wash.washStatus === WashStatus.READY_PICKUP,
    );

    const calculateEstimatedTime = (wash: CarWash) => {
      if (wash.washStatus === WashStatus.WAITING) {
        const position = waiting.findIndex((w) => w.id === wash.id);
        return 15 + position * 10;
      }
      if (wash.washStatus === WashStatus.IN_PROGRESS && wash.startedAt) {
        const elapsed = Math.floor(
          (Date.now() - new Date(wash.startedAt).getTime()) / 60000,
        );
        const estimated = 30;
        return Math.max(0, estimated - elapsed);
      }
      return 0;
    };

    const formatWash = (wash: CarWash) => ({
      id: wash.id,
      trackingToken: wash.trackingToken,
      status: wash.washStatus,
      vehicle: {
        licensePlate: wash.vehicle.licensePlate,
        model: wash.vehicle.model,
        color: wash.vehicle.color,
        type: wash.vehicle.type,
      },
      customer: {
        id: wash.customer.id,
        name: wash.customer.name,
        phone: wash.customer.phone,
      },
      service: {
        type: wash.serviceType,
        amount: wash.amount,
      },
      paymentStatus: wash.paymentStatus,
      estimatedTimeMinutes: calculateEstimatedTime(wash),
      dateTime: wash.dateTime,
      startedAt: wash.startedAt,
      completedAt: wash.completedAt,
      employees: wash.employees.map((emp) => ({
        id: emp.id,
        name: emp.name,
      })),
    });

    return {
      total: activeWashes.length,
      columns: {
        waiting: {
          title: 'AGUARDANDO',
          count: waiting.length,
          items: waiting.map(formatWash),
        },
        inProgress: {
          title: 'LAVANDO',
          count: inProgress.length,
          items: inProgress.map(formatWash),
        },
        ready: {
          title: 'PRONTO',
          count: ready.length,
          items: ready.map(formatWash),
        },
      },
    };
  }
}
