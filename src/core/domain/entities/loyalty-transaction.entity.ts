import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { LoyaltyCard } from "./loyalty-card.entity";
import { CarWash } from "./car-wash.entity";

export enum TransactionType {
  EARN = "earn",
  REDEEM = "redeem",
}

@Entity("loyalty_transactions")
export class LoyaltyTransaction extends BaseEntity {
  @Column()
  loyaltyCardId: number;

  @ManyToOne(() => LoyaltyCard, (card) => card.transactions)
  @JoinColumn({ name: "loyaltyCardId" })
  loyaltyCard: LoyaltyCard;

  @Column({ nullable: true })
  carWashId?: number;

  @ManyToOne(() => CarWash)
  @JoinColumn({ name: "carWashId" })
  carWash?: CarWash;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: "int" })
  points: number;

  @Column({ type: "text", nullable: true })
  description?: string;
}
