import {MigrationInterface, QueryRunner} from "typeorm"

export class Company1689873160505 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "company"
            (
                "id"         SERIAL            NOT NULL,
                "name"       character varying NOT NULL,
                "population" integer           NOT NULL,
                "locatedId"  integer,
                CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id")
            );
        `);

        await queryRunner.query(`
            ALTER TABLE "company"
                ADD CONSTRAINT "FK_da24bcf19aaf1d101650258615d" FOREIGN KEY ("locatedId")
                    REFERENCES "city" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "company" DROP CONSTRAINT "FK_da24bcf19aaf1d101650258615d"`,
        );
        await queryRunner.query(`DROP TABLE "company"`);

    }

}
