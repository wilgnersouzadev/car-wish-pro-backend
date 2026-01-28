import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Vehicle } from "./vehicle.entity";
import { CarWash } from "./car-wash.entity";

@Entity("customers")
export class Customer extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ default: false })
  isFrequentCustomer: boolean;

  @OneToMany(() => Vehicle, (vehicle) => vehicle.customer)
  vehicles: Vehicle[];

  @OneToMany(() => CarWash, (carWash) => carWash.customer)
  washes: CarWash[];
}

