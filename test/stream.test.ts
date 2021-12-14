import { run_with_table } from "./utils";


describe("Stream Test Suite", () => {
  
  it("should support consume object stream with sugar", () => run_with_table( 
    { ID: "bigint not null", NAME: "nvarchar(255)" }, 
    async (client, table_name) => {
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"], [3, "Nano"], [4, "Jobs"]);
      expect(affectedRows).toStrictEqual([1, 1, 1, 1]);
      let count = 0;
      for await (const row of client.streamQueryObject(`SELECT ID, NAME FROM ${table_name}`)) {
        count++;
        expect(row.ID).not.toBeUndefined();
        expect(row.NAME).not.toBeUndefined();
      }
      expect(count).toBe(4);
    }));

  it("should support consume list stream with sugar", () => run_with_table( 
    { ID: "bigint not null", NAME: "nvarchar(255)" }, 
    async (client, table_name) => {
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"], [3, "Nano"], [4, "Jobs"]);
      expect(affectedRows).toStrictEqual([1, 1, 1, 1]);
      let count = 0;
      for await (const rows of client.streamQueryList(`SELECT ID, NAME FROM ${table_name}`)) {
        rows.forEach(row => {
          count++;
          expect(row.ID).not.toBeUndefined();
          expect(row.NAME).not.toBeUndefined();
        });
      }
      expect(count).toBe(4);
    }));

});
