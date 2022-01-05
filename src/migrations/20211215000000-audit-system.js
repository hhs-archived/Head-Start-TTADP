const dmlType = ['INSERT', 'UPDATE', 'DELETE'];

module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(
    async (transaction) => {
      await queryInterface.sequelize.query(
        `DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dml_type') THEN
                CREATE TYPE dml_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');
            END IF;
        END$$;`,
        { transaction },
      ).then(() => {
        console.log('Create enum type');
      }).catch((err) => {
        console.error(err);
      });

      // await queryInterface.createTable('ZZAuditDescriptor', {
      //   id: {
      //     allowNull: false,
      //     autoIncrement: true,
      //     primaryKey: true,
      //     type: Sequelize.INTEGER,
      //   },
      //   descriptor: {
      //     allowNull: false,
      //     type: Sequelize.TEXT,
      //   },
      // });

      // await queryInterface.sequelize.query(
      //   `CREATE OR REPLACE FUNCTION "ZZAuditFunctionDescriptorToID"(_param_id text)
      //   RETURNS INTEGER AS
      //   $func$
      //   DECLARE
      //       Did INTEGER;
      //   BEGIN
      //       IF _param_id IS NOT NULL THEN
      //           Did := id FROM "ZZAuditDescriptor" WHERE descriptor = _param_id;
      //           IF Did IS NULL THEN
      //               INSERT INTO "ZZAuditDescriptor" (descriptor) VALUES (_param_id);
      //               Did := id FROM "ZZAuditDescriptor" WHERE descriptor = _param_id;
      //           END IF;
      //       END IF;
      //       RETURN Did;
      //   END
      //   $func$  LANGUAGE plpgsql;`,
      //   { transaction },
      // );

      await queryInterface.createTable('ZZAuditFilter', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        tableName: {
          allowNull: true,
          default: null,
          type: Sequelize.STRING,
        },
        columnName: {
          allowNull: false,
          type: Sequelize.STRING,
        },
      },
      { transaction }).then(() => {
        console.log('Create ZZAuditFilter table');
      }).catch((err) => {
        console.error(err);
      });

      await queryInterface.sequelize.query(
        `INSERT INTO "ZZAuditFilter" ("tableName", "columnName")
        VALUES ( NULL, 'updatedAt');`,
        { transaction },
      ).then(() => {
        console.log('Populate ZZAuditFilter table');
      }).catch((err) => {
        console.error(err);
      });

      const SequelizeDmlType = Sequelize.DataTypes.ENUM(...dmlType);

      await queryInterface.sequelize.query(
        `SELECT json_agg(table_name) as "tables"
        FROM information_schema.tables
        WHERE table_schema='public'
          AND table_type='BASE TABLE'
          AND table_catalog='ttasmarthub'
          AND table_name != 'SequelizeMeta'
          AND table_name NOT LIKE 'ZZAuditLog%';`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      ).then((result) => {
        const [{ tables }] = result;
        console.log(`Find all tables: ${JSON.stringify(tables)}`);
        tables.forEach(async (table) => {
          await queryInterface.sequelize.query(
            `CREATE TABLE IF NOT EXISTS "ZZAuditLog${table}" (
            id BIGSERIAL,
            data_id bigint NOT NULL,
            dml_type dml_type NOT NULL,
            old_row_data jsonb,
            new_row_data jsonb,
            dml_timestamp timestamp NOT NULL,
            dml_by int NOT NULL,
            dml_txid uuid NOT NULL,
            descriptor_id INT,
            PRIMARY KEY (id)
        );`,
            { transaction },
          ).then(() => {
            console.log(`Create ZZAuditLog${table}`);
          }).catch((err) => {
            console.error(err);
          });
          // await queryInterface.createTable(`ZZAuditLog${table}`, {
          //   id: {
          //     type: Sequelize.DataTypes.BIGINT,
          //     allowNull: false,
          //     primaryKey: true,
          //     autoIncrement: true,
          //   },
          //   data_id: {
          //     allowNull: false,
          //     autoIncrement: false,
          //     type: Sequelize.INTEGER,
          //   },
          //   dml_type: {
          //     type: SequelizeDmlType,
          //     allowNull: false,
          //     validate: {
          //       isIn: {
          //         args: [...dmlType],
          //         msg: 'Action must be create, update, or delete',
          //       },
          //     },
          //   },
          //   old_row_data: {
          //     type: Sequelize.DataTypes.JSON,
          //     allowNull: true,
          //   },
          //   new_row_data: {
          //     type: Sequelize.DataTypes.JSON,
          //     allowNull: true,
          //   },
          //   dml_timestamp: {
          //     allowNull: false,
          //     type: Sequelize.DataTypes.DATE,
          //   },
          //   dml_by: {
          //     type: Sequelize.DataTypes.INTEGER,
          //     allowNull: true,
          //     defaultValue: null,
          //     comment: null,
          //   },
          //   dml_txid: {
          //     type: Sequelize.DataTypes.UUID,
          //     allowNull: false,
          //     validate: { isUUID: 'all' },
          //   },
          //   descriptor_id: {
          //     type: Sequelize.DataTypes.INTEGER,
          //     allowNull: true,
          //     defaultValue: null,
          //   },
          // },
          // {
          //   transaction,
          // }).then(() => {
          //   console.log(`Create ZZAuditLog${table}`);
          // }).catch((err) => {
          //   console.error(err);
          // });
        });
      }).catch((err) => {
        console.error(err);
      });

      // Promise.all(tables.map(async (table) => {
      //   await queryInterface.createTable(`ZZAuditLog${table}`, {
      //     id: {
      //       type: Sequelize.DataTypes.BIGINT,
      //       allowNull: false,
      //       primaryKey: true,
      //       autoIncrement: true,
      //     },
      //     data_id: {
      //       allowNull: false,
      //       autoIncrement: false,
      //       type: Sequelize.INTEGER,
      //     },
      //     dml_type: {
      //       type: Sequelize.DataTypes.ENUM(...dmlType),
      //       allowNull: false,
      //       validate: {
      //         isIn: {
      //           args: [...dmlType],
      //           msg: 'Action must be create, update, or delete',
      //         },
      //       },
      //     },
      //     old_row_data: {
      //       type: Sequelize.DataTypes.JSON,
      //       allowNull: true,
      //     },
      //     new_row_data: {
      //       type: Sequelize.DataTypes.JSON,
      //       allowNull: true,
      //     },
      //     dml_timestamp: {
      //       allowNull: false,
      //       type: Sequelize.DataTypes.DATE,
      //     },
      //     dml_by: {
      //       type: Sequelize.DataTypes.INTEGER,
      //       allowNull: true,
      //       defaultValue: null,
      //       comment: null,
      //     },
      //     dml_txid: {
      //       type: Sequelize.DataTypes.UUID,
      //       allowNull: false,
      //       validate: { isUUID: 'all' },
      //     },
      //     descriptor_id: {
      //       type: Sequelize.DataTypes.INTEGER,
      //       allowNull: true,
      //       defaultValue: null,
      //     },
      //   },
      //   {
      //     transaction,
      //   });
      // }));

      // tables.forEach(async (table) => {
      //   // if (CreateTable(queryInterface, Sequelize, table)) {
      //   //   console.log(`${table}: Audited`);
      //   // } else {
      //   //   console.log(`${table}: Not Audited`);
      //   // }
      //   await queryInterface.createTable(`ZZAuditLog${table}`, {
      //     id: {
      //       type: Sequelize.DataTypes.BIGINT,
      //       allowNull: false,
      //       primaryKey: true,
      //       autoIncrement: true,
      //     },
      //     data_id: {
      //       allowNull: false,
      //       autoIncrement: false,
      //       type: Sequelize.INTEGER,
      //     },
      //     dml_type: {
      //       type: Sequelize.DataTypes.ENUM(...dmlType),
      //       allowNull: false,
      //       validate: {
      //         isIn: {
      //           args: [...dmlType],
      //           msg: 'Action must be create, update, or delete',
      //         },
      //       },
      //     },
      //     old_row_data: {
      //       type: Sequelize.DataTypes.JSON,
      //       allowNull: true,
      //     },
      //     new_row_data: {
      //       type: Sequelize.DataTypes.JSON,
      //       allowNull: true,
      //     },
      //     dml_timestamp: {
      //       allowNull: false,
      //       type: Sequelize.DataTypes.DATE,
      //     },
      //     dml_by: {
      //       type: Sequelize.DataTypes.INTEGER,
      //       allowNull: true,
      //       defaultValue: null,
      //       comment: null,
      //     },
      //     dml_txid: {
      //       type: Sequelize.DataTypes.UUID,
      //       allowNull: false,
      //       validate: { isUUID: 'all' },
      //     },
      //     descriptor_id: {
      //       type: Sequelize.DataTypes.INTEGER,
      //       allowNull: true,
      //       defaultValue: null,
      //     },
      //   },
      //   {
      //     transaction,
      //   }).then(() => {
      //     console.log('Create ZZAuditLog for table');
      //   }).catch((err) => {
      //     console.error(err);
      //   });

      //   // await queryInterface.sequelize.query(
      //   //   `CREATE OR REPLACE FUNCTION "ZZAuditFunction${table}"()
      //   //   RETURNS trigger AS $body$
      //   //   DECLARE
      //   //       CREATED_BY bigint;
      //   //       TRANSACTION_ID uuid;
      //   //       DESCRIPTOR_ID int;
      //   //       UNIQUE_OLD jsonb;
      //   //       UNIQUE_NEW jsonb;
      //   //       IS_LOGGABLE boolean;
      //   //   BEGIN
      //   //       CREATED_BY := COALESCE(current_setting('var.loggedUser', true)::BIGINT, -1);
      //   //       TRANSACTION_ID := COALESCE(
      //   //        current_setting('var.transactionId', true)::uuid,
      //   //        lpad(txid_current()::text,32,'0')::uuid);
      //   //       DESCRIPTOR_ID := "ZZAuditFunctionDescriptorToID"(
      //   //        NULLIF(current_setting('var.auditDescriptor', true)::TEXT, ''));

      //   //       IF (TG_OP = 'INSERT') THEN
      //   //         INSERT INTO "ZZAuditLog${table}" (
      //   //             data_id,
      //   //             old_row_data,
      //   //             new_row_data,
      //   //             dml_type,
      //   //             dml_timestamp,
      //   //             dml_created_by,
      //   //             dml_txid,
      //   //             descriptor_id
      //   //         )
      //   //         VALUES(
      //   //             NEW.id,
      //   //             null,
      //   //             to_jsonb(NEW),
      //   //             'INSERT',
      //   //             CURRENT_TIMESTAMP,
      //   //             CREATED_BY,
      //   //             TRANSACTION_ID,
      //   //             DESCRIPTOR_ID
      //   //         );

      //   //         RETURN NEW;
      //   //       ELSIF (TG_OP = 'UPDATE') THEN
      //   //         SELECT
      //   //           json_object(array_agg(a.columnname),array_agg(a.pre_value)) AS pre,
      //   //           json_object(array_agg(a.columnname),array_agg(a.post_value)) AS post,
      //   //           (count(Trigerable) - count(NULLIF(Trigerable,TRUE)) > 0) AS loggable
      //   //         INTO
      //   //           UNIQUE_OLD,
      //   //           UNIQUE_NEW,
      //   //           IS_LOGGABLE
      //   //         FROM (
      //   //             SELECT
      //   //               pre.key AS columnname,
      //   //               pre.value #>> '{}' AS pre_value,
      //   //               post.value #>> '{}' AS post_value,
      //   //               NOT COALESCE(filter.columnName = filter.columnName,FALSE) as Trigerable
      //   //             FROM jsonb_each(to_jsonb(OLD)) AS pre
      //   //             INNER JOIN jsonb_each(to_jsonb(NEW)) AS post
      //   //             ON pre.key = post.key
      //   //             AND pre.value IS DISTINCT FROM post.value
      //   //             LEFT JOIN "ZZAuditFilter" filter
      //   //             ON pre.key = filter.columnName
      //   //             and ( filter.tableName = "${table}" OR filter.tableName IS NULL)
      //   //         ) a;

      //   //         IF IS_LOGGABLE THEN
      //   //           INSERT INTO "ZZAuditLog${table}" (
      //   //               data_id,
      //   //               old_row_data,
      //   //               new_row_data,
      //   //               dml_type,
      //   //               dml_timestamp,
      //   //               dml_created_by,
      //   //               dml_txid,
      //   //               descriptor_id
      //   //           )
      //   //           VALUES(
      //   //               NEW.id,
      //   //               UNIQUE_OLD,
      //   //               UNIQUE_NEW,
      //   //               'UPDATE',
      //   //               CURRENT_TIMESTAMP,
      //   //               CREATED_BY,
      //   //               TRANSACTION_ID,
      //   //               DESCRIPTOR_ID
      //   //           );
      //   //         END IF
      //   //         RETURN NEW;
      //   //      ELSIF (TG_OP = 'DELETE') THEN
      //   //       INSERT INTO "ZZAuditLog${table}" (
      //   //           data_id,
      //   //           old_row_data,
      //   //           new_row_data,
      //   //           dml_type,
      //   //           dml_timestamp,
      //   //           dml_created_by,
      //   //           dml_txid,
      //   //           descriptor_id
      //   //       )
      //   //       VALUES(
      //   //           OLD.id,
      //   //           to_jsonb(OLD),
      //   //           null,
      //   //           'DELETE',
      //   //           CURRENT_TIMESTAMP,
      //   //           CREATED_BY,
      //   //           TRANSACTION_ID,
      //   //           DESCRIPTOR_ID
      //   //       );

      //   //       RETURN OLD;
      //   //      END IF;

      //   //   END;
      //   //   $body$
      //   //   LANGUAGE plpgsql;`,
      //   //   { transaction },
      //   // );

      //   // await queryInterface.sequelize.query(
      //   //   `CREATE TRIGGER "ZZAuditTrigger${table}"
      //   //   AFTER INSERT OR UPDATE OR DELETE ON "${table}"
      //   //   FOR EACH ROW EXECUTE FUNCTION "ZZAuditFunction${table}"();`,
      //   //   { transaction },
      //   // );
      // }).catch((err) => {
      //   console.error(err);
      // });

      // const missingTables = await queryInterface.sequelize.query(
      //   `SELECT T.table_name AS "Table", A.table_name AS "Audit"
      //   FROM (SELECT table_name
      //     FROM information_schema.tables
      //    WHERE table_schema='public'
      //      AND table_type='BASE TABLE'
      //      AND table_catalog='ttasmarthub'
      //      AND table_name != 'SequelizeMeta'
      //      AND table_name NOT LIKE 'ZZAuditLog%') AS T
      //   LEFT JOIN (SELECT table_name
      //     FROM information_schema.tables
      //    WHERE table_schema='public'
      //      AND table_type='BASE TABLE'
      //      AND table_catalog='ttasmarthub'
      //      AND table_name != 'SequelizeMeta'
      //      AND table_name LIKE 'ZZAuditLog%') AS A
      //   ON T.table_name = right(A.table_name,Length(T.table_name))
      //   AND Length(T.table_name) + Length('ZZAuditLog') = Length(A.table_name)
      //   WHERE A.table_name IS NULL;`,
      //   {
      //     type: Sequelize.QueryTypes.SELECT,
      //     transaction,
      //   },
      // );
      // console.log(missingTables);
    },
  ),
  down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(
    async (transaction) => {
      const [{ tables }] = await queryInterface.sequelize.query(
        `SELECT json_agg(table_name) as "tables"
        FROM information_schema.tables
        WHERE table_schema='public'
          AND table_type='BASE TABLE'
          AND table_catalog='ttasmarthub'
          AND table_name != 'SequelizeMeta'
          AND table_name NOT LIKE 'ZZAuditLog%';`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      tables.forEach(async (table) => {
        // await queryInterface.sequelize.query(
        //   `DROP TRIGGER IF EXISTS "ZZAuditTrigger${table}"
        //   ON "${table}";`,
        //   { transaction },
        // );

        // await queryInterface.sequelize.query(
        //   `DROP FUNCTION IF EXISTS "ZZAuditFunction${table}"();`,
        //   { transaction },
        // );

        await queryInterface.sequelize.query(
          `DROP TABLE IF EXISTS "ZZAuditLog${table}";`,
          { transaction },
        );
      });

      await queryInterface.sequelize.query(
        'DROP TABLE IF EXISTS "ZZAuditFilter";',
        { transaction },
      );

      // await queryInterface.sequelize.query(
      //   'DROP FUNCTION IF EXISTS "ZZAuditFunctionDescriptorToID"();',
      //   { transaction },
      // );

      // await queryInterface.sequelize.query(
      //   'DROP TABLE IF EXISTS "ZZAuditDescriptor";',
      //   { transaction },
      // );
    },
  ),
};
