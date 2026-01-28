import { Column, Entity, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "./base-entity.entity";
import { CarWash } from "./car-wash.entity";

export enum CommissionType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

@Entity("employees")
export class Employee extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({
    type: "enum",
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  commissionType: CommissionType;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  commissionValue: number;

  @ManyToMany(() => CarWash, (carWash) => carWash.employees)
  @JoinTable({
    name: "car_wash_employee",
    joinColumn: { name: "employeeId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "carWashId", referencedColumnName: "id" },
  })
  carWashes: CarWash[];
}

