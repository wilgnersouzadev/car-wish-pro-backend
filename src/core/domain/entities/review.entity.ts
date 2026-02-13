import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { CarWash } from "./car-wash.entity";
import { Customer } from "./customer.entity";
import { Shop } from "./shop.entity";

@Entity("reviews")
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int" })
  carWashId: number;

  @ManyToOne(() => CarWash)
  @JoinColumn({ name: "carWashId" })
  carWash: CarWash;

  @Column({ type: "int" })
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column({ type: "int" })
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @Column({ type: "int", comment: "Nota de 1 a 5" })
  rating: number;

  @Column({ type: "text", nullable: true })
  comment: string;

  @Column({ type: "text", nullable: true })
  response: string;

  @Column({ type: "timestamp", nullable: true })
  respondedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
