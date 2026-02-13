import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateReviews1770800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "reviews",
        columns: [
          {
            name: "id",
            type: "int",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "carWashId",
            type: "int",
          },
          {
            name: "customerId",
            type: "int",
          },
          {
            name: "shopId",
            type: "int",
          },
          {
            name: "rating",
            type: "int",
            comment: "Nota de 1 a 5",
          },
          {
            name: "comment",
            type: "text",
            isNullable: true,
          },
          {
            name: "response",
            type: "text",
            isNullable: true,
          },
          {
            name: "respondedAt",
            type: "timestamp",
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
        ],
      }),
      true
    );

    await queryRunner.createForeignKey(
      "reviews",
      new TableForeignKey({
        columnNames: ["carWashId"],
        referencedColumnNames: ["id"],
        referencedTableName: "car_washes",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "reviews",
      new TableForeignKey({
        columnNames: ["customerId"],
        referencedColumnNames: ["id"],
        referencedTableName: "customers",
        onDelete: "CASCADE",
      })
    );

    await queryRunner.createForeignKey(
      "reviews",
      new TableForeignKey({
        columnNames: ["shopId"],
        referencedColumnNames: ["id"],
        referencedTableName: "shops",
        onDelete: "CASCADE",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("reviews");
  }
}
