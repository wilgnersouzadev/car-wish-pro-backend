import { Column, Entity, ManyToOne, ManyToMany, JoinColumn, JoinTable } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Customer } from "./customer.entity";
import { Vehicle } from "./vehicle.entity";
import { Employee } from "./employee.entity";

export enum ServiceType {
  BASIC = "basic",
  FULL = "full",
  POLISH = "polish",
}

export enum PaymentMethod {
  CASH = "cash",
  PIX = "pix",
  CARD = "card",
}

export enum PaymentStatus {
  PAID = "paid",
  PENDING = "pending",
}

@Entity("car_washes")
export class CarWash extends BaseEntity {
  @Column()
  vehicleId: number;

  @Column()
  customerId: number;

  @Column({
    type: "enum",
    enum: ServiceType,
  })
  serviceType: ServiceType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: "enum",
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ type: "timestamp" })
  dateTime: Date;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.carWashes)
  @JoinColumn({ name: "vehicleId" })
  vehicle: Vehicle;

  @ManyToOne(() => Customer, (customer) => customer.washes)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @ManyToMany(() => Employee, (employee) => employee.carWashes)
  employees: Employee[];
}

