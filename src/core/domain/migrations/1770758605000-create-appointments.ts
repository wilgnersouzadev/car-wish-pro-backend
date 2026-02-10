import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateAppointments1770758605000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "appointments",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "shopId",
            type: "int",
          },
          {
            name: "customerId",
            type: "int",
          },
          {
            name: "vehicleId",
            type: "int",
          },
          {
            name: "serviceType",
            type: "varchar",
            length: "100",
          },
          {
            name: "scheduledDate",
            type: "date",
          },
          {
            name: "scheduledTime",
            type: "time",
          },
          {
            name: "status",
            type: "enum",
            enum: ["pending", "confirmed", "completed", "cancelled"],
            default: "'pending'",
          },
          {
            name: "notes",
            type: "text",
            isNullable: true,
          },
          {
            name: "createdBy",
            type: "int",
            isNullable: true,
          },
          {
            name: "createdAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "updatedAt",
            type: "timestamp",
            default: "now()",
          },
          {
            name: "deletedAt",
            type: "timestamp",
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["shopId"],
        referencedColumnNames: ["id"],
        referencedTableName: "shops",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "customers",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["vehicleId"],
        referencedColumnNames: ["id"],
        referencedTableName: "vehicles",
        onDelete: "CASCADE",
      }),
    );

    await queryRunner.createForeignKey(
      "appointments",
      new TableForeignKey({
        columnNames: ["createdBy"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      }),
    );

    // Indexes para melhorar performance
    await queryRunner.query(
      `CREATE INDEX idx_appointments_shop_date ON appointments("shopId", "scheduledDate")`,
    );
    await queryRunner.query(
      `CREATE INDEX idx_appointments_status ON appointments(status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("appointments");
  }
}
