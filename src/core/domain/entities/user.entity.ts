import { Column, Entity, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { CarWash } from "./car-wash.entity";

export enum UserRole {
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
