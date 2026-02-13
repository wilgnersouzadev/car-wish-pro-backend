import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddTrackingFields1770758607000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adicionar enum para washStatus
    await queryRunner.query(`
      CREATE TYPE "wash_status_enum" AS ENUM (
        'waiting',
        'in_progress',
        'completed',
        'ready_pickup',
        'delivered'
      );
    `);

    // Adicionar coluna trackingToken
    await queryRunner.addColumn(
      "car_washes",
      new TableColumn({
        name: "trackingToken",
        type: "varchar",
        isUnique: true,
        isNullable: false,
        default: "uuid_generate_v4()",
      })
    );

    // Adicionar coluna washStatus
    await queryRunner.addColumn(
      "car_washes",
      new TableColumn({
        name: "washStatus",
        type: "wash_status_enum",
        default: "'waiting'",
        isNullable: false,
      })
    );

    // Adicionar coluna startedAt
    await queryRunner.addColumn(
      "car_washes",
      new TableColumn({
        name: "startedAt",
        type: "timestamp",
        isNullable: true,
      })
    );

    // Adicionar coluna completedAt
    await queryRunner.addColumn(
      "car_washes",
      new TableColumn({
        name: "completedAt",
        type: "timestamp",
        isNullable: true,
      })
    );

    // Gerar tokens para registros existentes
    await queryRunner.query(`
      UPDATE car_washes
      SET "trackingToken" = gen_random_uuid()::text
      WHERE "trackingToken" IS NULL OR "trackingToken" = '';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("car_washes", "completedAt");
    await queryRunner.dropColumn("car_washes", "startedAt");
    await queryRunner.dropColumn("car_washes", "washStatus");
    await queryRunner.dropColumn("car_washes", "trackingToken");
    await queryRunner.query(`DROP TYPE "wash_status_enum";`);
  }
}
