import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Shop } from "./shop.entity";
import { LoyaltyCard } from "./loyalty-card.entity";

export enum RewardType {
  FREE_WASH = "free_wash",
  DISCOUNT_PERCENTAGE = "discount_percentage",
  DISCOUNT_FIXED = "discount_fixed",
}

@Entity("loyalty_programs")
export class LoyaltyProgram extends BaseEntity {
  @Column()
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @Column({ length: 255 })
  name: string;

  @Column({ type: "int" })
  washesRequired: number;

  @Column({
    type: "enum",
    enum: RewardType,
  })
  rewardType: RewardType;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  rewardValue?: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LoyaltyCard, (card) => card.loyaltyProgram)
  cards: LoyaltyCard[];
}
