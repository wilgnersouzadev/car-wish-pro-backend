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

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.washes)
  @JoinColumn({ name: "veiculoId" })
  vehicle: Vehicle;

  @ManyToOne(() => Customer, (customer) => customer.washes)
  @JoinColumn({ name: "clienteId" })
  customer: Customer;

  @ManyToMany(() => Employee, (employee) => employee.washes)
  @JoinTable({
    name: "lavagem_funcionario",
    joinColumn: { name: "lavagemId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "funcionarioId", referencedColumnName: "id" },
  })
  employees: Employee[];
}

