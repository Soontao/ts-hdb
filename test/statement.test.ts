import { FunctionCode } from "../src";
import { run_with_client, run_with_table } from "./utils";


describe("Statement Test Suite", () => {
  
  it("should support prepare for some specific statements",  () => run_with_client(async(client) => {
    
    const commit = await client.prepare("commit");
    expect(commit.functionCode).toBe(FunctionCode.COMMIT);

    const rollback = await client.prepare("rollback");
    expect(rollback.functionCode).toBe(FunctionCode.ROLLBACK);

  }));

  it("should support consume list stream with sugar", () => run_with_table( 
    { ID: "bigint not null", NAME: "nvarchar(255)" }, 
    async (client, table_name) => {
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);

      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      expect(stat.id).toBeInstanceOf(Buffer);
      expect(stat.functionCode).toBe(FunctionCode.INSERT);

      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"], [3, "Nano"], [4, "Jobs"]);
      
      expect(affectedRows).toStrictEqual([1, 1, 1, 1]);

      const queryStat = client.prepare(`SELECT ID, name from ${table_name} where id = ? and name = ?`);
      
      let rows = [];
      for await (const row of (await queryStat).streamQueryObject(1, "Theo")) {
        expect(row.ID).not.toBeUndefined();
        expect(row.NAME).not.toBeUndefined();
        rows.push(row);
      }
      expect(rows.length).toBe(1);

      rows = [];
      for await (const row of (await queryStat).streamQueryObject(2, "Theo")) {
        // in fact, this block not executed
        expect(row.ID).not.toBeUndefined();
        expect(row.NAME).not.toBeUndefined();
        rows.push(row);
      }
      expect(rows.length).toBe(0);


      rows = [];
      for await (const internalRows of (await queryStat).streamQueryList(1, "Theo")) {
        internalRows.forEach(row => {
          expect(row.ID).not.toBeUndefined();
          expect(row.NAME).not.toBeUndefined();
          rows.push(row);
        });
      }
      expect(rows.length).toBe(1);

      rows = [];
      for await (const internalRows of (await queryStat).streamQueryList(2, "Theo")) {
        // in fact, this block not executed
        internalRows.forEach(row => {
          expect(row.ID).not.toBeUndefined();
          expect(row.NAME).not.toBeUndefined();
          rows.push(row);
        });
      }
      expect(rows.length).toBe(0);
      
    })
  );

});
