import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Shop } from "./shop.entity";
import { Customer } from "./customer.entity";
import { Vehicle } from "./vehicle.entity";
import { User } from "./user.entity";

export enum AppointmentStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("appointments")
export class Appointment extends BaseEntity {
  @Column()
  shopId: number;

  @Column()
  customerId: number;

  @Column()
  vehicleId: number;

  @Column({ length: 100 })
  serviceType: string;

  @Column({ type: "date" })
  scheduledDate: string;

  @Column({ type: "time" })
  scheduledTime: string;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ nullable: true })
  createdBy?: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: "vehicleId" })
  vehicle: Vehicle;

  @ManyToOne(() => User)
  @JoinColumn({ name: "createdBy" })
  creator?: User;
}
