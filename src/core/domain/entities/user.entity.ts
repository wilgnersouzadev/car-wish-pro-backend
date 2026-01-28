import { Column, Entity, ManyToMany, ManyToOne, JoinTable, JoinColumn } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { CarWash } from "./car-wash.entity";
import { Shop } from "./shop.entity";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  EMPLOYEE = "employee",
}

export enum CommissionType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

@Entity("users")
export class User extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  email: string;

  /** Loja atual em uso (contexto) - pode ser null para super_admin */
  @Column({ nullable: true })
  shopId: number | null;

  @ManyToOne(() => Shop, (shop) => shop.currentUsers, { nullable: true })
  @JoinColumn({ name: "shopId" })
  currentShop: Shop | null;

  /** Lojas que o admin possui (ManyToMany) - apenas para role ADMIN */
  @ManyToMany(() => Shop, (shop) => shop.owners)
  @JoinTable({
    name: "user_shops",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "shopId", referencedColumnName: "id" },
  })
  shops: Shop[];

  @Column({ length: 255, select: false })
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.EMPLOYEE,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  /** Apenas para role EMPLOYEE */
  @Column({
    type: "enum",
    enum: CommissionType,
    nullable: true,
  })
  commissionType: CommissionType | null;

  /** Apenas para role EMPLOYEE */
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  commissionValue: number | null;

  @ManyToMany(() => CarWash, (carWash) => carWash.employees)
  @JoinTable({
    name: "car_wash_user",
    joinColumn: { name: "userId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "carWashId", referencedColumnName: "id" },
  })
  carWashes: CarWash[];
}
