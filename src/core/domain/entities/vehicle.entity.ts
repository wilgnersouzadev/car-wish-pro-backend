import { Column, Entity, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Customer } from "./customer.entity";
import { CarWash } from "./car-wash.entity";
import { Shop } from "./shop.entity";

export enum VehicleType {
  CAR = "car",
  MOTORCYCLE = "motorcycle",
  PICKUP = "pickup",
}

@Entity("vehicles")
export class Vehicle extends BaseEntity {
  @Column({ length: 10 })
  licensePlate: string;

  @Column({ length: 255 })
  model: string;

  @Column({ length: 50 })
  color: string;

  @Column({
    type: "enum",
    enum: VehicleType,
    default: VehicleType.CAR,
  })
  type: VehicleType;

  @Column()
  customerId: number;

  @Column()
  shopId: number;

  @ManyToOne(() => Shop, (shop) => shop.vehicles)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @ManyToOne(() => Customer, (customer) => customer.vehicles)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @OneToMany(() => CarWash, (carWash) => carWash.vehicle)
  carWashes: CarWash[];
}

