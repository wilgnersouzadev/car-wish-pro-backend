import { Column, Entity, OneToMany, ManyToMany } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { User } from "./user.entity";
import { Customer } from "./customer.entity";
import { Vehicle } from "./vehicle.entity";
import { CarWash } from "./car-wash.entity";

@Entity("shops")
export class Shop extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "text", nullable: true })
  logoUrl?: string;

  /** Usuários que estão usando esta loja no momento (contexto atual) */
  @OneToMany(() => User, (user) => user.currentShop)
  currentUsers: User[];

  /** Admins que possuem esta loja */
  @ManyToMany(() => User, (user) => user.shops)
  owners: User[];

  @OneToMany(() => Customer, (customer) => customer.shop)
  customers: Customer[];

  @OneToMany(() => Vehicle, (vehicle) => vehicle.shop)
  vehicles: Vehicle[];

  @OneToMany(() => CarWash, (carWash) => carWash.shop)
  carWashes: CarWash[];
}
