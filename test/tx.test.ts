import HDBClient from "../src";
import { get_db_options, random_table_name } from "./utils";


describe("Transaction Test Suite", () => {
  

  it("should support transaction process", async () => {
    
    const client = new HDBClient(get_db_options());
    const another_client = new HDBClient(get_db_options());
    const table_name = random_table_name();
    await client.exec(`CREATE COLUMN TABLE ${table_name} (
      ID bigint NOT NULL, 
      NAME nvarchar(255)
    )`);
    
    try {

      await client.setAutoCommit(false);
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"]);
      expect(affectedRows).toStrictEqual([1, 1]);
      await stat.drop();

      const [{TOTAL}] = await client.exec(`SELECT COUNT(1) AS TOTAL FROM ${table_name}`);
      expect(TOTAL).toBe(2);
      const [{A_TOTAL}] = await another_client.query(`SELECT COUNT(1) AS A_TOTAL FROM ${table_name}`);
      expect(A_TOTAL).toBe(0);
      
      await client.commit();
      const [{B_TOTAL}] = await another_client.query(`SELECT COUNT(1) AS B_TOTAL FROM ${table_name}`);
      expect(B_TOTAL).toBe(2);

      await client.rollback();

    } finally {
      await client.exec(`DROP TABLE ${table_name}`);
      await client.disconnect();    
      client.close();

      await another_client.disconnect();    
      another_client.close();
      
    }


  });

});
