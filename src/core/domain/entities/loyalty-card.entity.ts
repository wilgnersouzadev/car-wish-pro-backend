import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { Customer } from "./customer.entity";
import { Shop } from "./shop.entity";
import { LoyaltyProgram } from "./loyalty-program.entity";
import { LoyaltyTransaction } from "./loyalty-transaction.entity";

@Entity("loyalty_cards")
export class LoyaltyCard extends BaseEntity {
  @Column()
  customerId: number;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: "customerId" })
  customer: Customer;

  @Column()
  shopId: number;

  @ManyToOne(() => Shop)
  @JoinColumn({ name: "shopId" })
  shop: Shop;

  @Column()
  loyaltyProgramId: number;

  @ManyToOne(() => LoyaltyProgram, (program) => program.cards)
  @JoinColumn({ name: "loyaltyProgramId" })
  loyaltyProgram: LoyaltyProgram;

  @Column({ type: "int", default: 0 })
  currentPoints: number;

  @Column({ type: "int", default: 0 })
  totalRewardsRedeemed: number;

  @OneToMany(() => LoyaltyTransaction, (transaction) => transaction.loyaltyCard)
  transactions: LoyaltyTransaction[];
}
