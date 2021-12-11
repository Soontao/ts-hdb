import { HDBClient } from "../src";
import { DataType, FunctionCode } from "../src/types";
import { get_db_options, random_table_name, run_with_table } from "./utils";

describe("Basic Test Suite", () => {

  it("should support connect to database and query dummy", async () => {
    
    expect(get_db_options().host).not.toBeUndefined();
    const client = new HDBClient(get_db_options());
    try {
      const rows = await client.exec("SELECT 1 AS LABEL_ONE FROM DUMMY");
      expect(rows).toHaveLength(1);
      expect(rows[0]).toHaveProperty("LABEL_ONE");
      expect(rows[0].LABEL_ONE).toBe(1);
  
      expect(client.readyState).toBe("connected");
      expect(typeof client.clientId).toBe("string");
    } finally {
      await client.disconnect();    
      client.close();
    }

  });

  it("should support create/update/delete with parameter", async () => {
    const client = new HDBClient(get_db_options());
    const table_name = random_table_name();
    const response =  await client.exec(`CREATE COLUMN TABLE ${table_name} (
      ID bigint NOT NULL, 
      NAME nvarchar(255)
    )`);

    try {
    
      expect(response).toBeUndefined();
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"]);
      expect(affectedRows).toStrictEqual([1, 1]);
      expect(await stat.write(3, "Melon")).toStrictEqual(1);
      
      await stat.drop();

      const [{ TOTAL }] = await client.exec(`SELECT COUNT(1) AS TOTAL FROM ${table_name}`);
      expect(TOTAL).toBe(3);

      const query_stat = await client.prepare(`SELECT ID, name FROM ${table_name} WHERE ID = ?`);
      expect(query_stat).not.toBeUndefined();
      const result_set = await query_stat.query(1);
      expect(result_set).toHaveLength(1);
      expect(result_set[0].NAME).toBe("Theo");

      const query_rs = await query_stat.streamQuery(2);
      expect(query_rs).not.toBeUndefined();
      
      // assert metadata
      expect(query_rs.metadata).toHaveLength(2);
      expect(query_rs.metadata[0].columnName).toBe("ID");
      expect(query_rs.metadata[0].dataType).toBe(DataType.BIGINT);

      for await (const row of query_rs.createObjectStream()) {
        expect(row.ID).not.toBeUndefined();
        expect(row.NAME).not.toBeUndefined();
      }
      query_rs.close();

      const update_stat = await client.prepare(`UPDATE ${table_name} SET NAME = ? WHERE ID = ?`);
      expect(update_stat.functionCode).toBe(FunctionCode.UPDATE);
      const update_affected = await update_stat.write(["Theo New", 2], ["Melon New", 3]);
      expect(update_affected).toStrictEqual([1, 1]);

      expect((await query_stat.query(2))[0].NAME).toBe("Theo New");

      await query_stat.drop();

    } finally {
      await client.exec(`DROP TABLE ${table_name}`);
      await client.disconnect();    
      client.close();
    }

  });

  it("should support update/delete statements",  () => run_with_table(
    { ID: "bigint NOT NULL PRIMARY KEY", NAME: "nvarchar(255)" }, 
    async(client, table_name) => {
      const inserted = await client.exec(`INSERT INTO ${table_name} VALUES (1, 'Theo')`);
      expect(inserted).toStrictEqual(1);

      const updated = await client.exec(`UPDATE ${table_name} SET NAME = 'Theo Updated' WHERE ID = 1`);
      expect(updated).toBe(1);

      const updated_2 = await client.exec(`UPDATE ${table_name} SET NAME = 'Theo Updated' WHERE NAME = 'Theo'`);
      expect(updated_2).toBe(0);

      // update
      const upsert = await client.exec(`UPSERT ${table_name} VALUES (1, 'Theo Updated 2') WITH PRIMARY KEY`);
      expect(upsert).toBe(1);

      // insert
      const upsert_2 = await client.exec(`UPSERT ${table_name} VALUES (11, 'Theo New') WITH PRIMARY KEY`);
      expect(upsert_2).toBe(1);

      const deleted_1 = await client.exec(`delete from ${table_name} WHERE NAME = 'Theo Updated 2'`);
      expect(deleted_1).toBe(1);

      const deleted_2 = await client.exec(`delete from ${table_name} WHERE NAME = 'Theo Updated 2'`);
      expect(deleted_2).toBe(0);
    }
  ));

  
 
});
