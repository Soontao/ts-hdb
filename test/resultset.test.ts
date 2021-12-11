import { run_with_table } from "./utils";

describe("ResultSet Test Suite", () => {

  it("should support read as stream", () => run_with_table(

    { ID: "bigint not null", NAME: "nvarchar(255)" }, 
    async (client, table_name) => {

      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      expect(stat).not.toBeUndefined();
      expect(stat.id).not.toBeUndefined();
      const affectedRows = await stat.write([1, "Theo"], [2, "Neo"], [3, "Nano"], [4, "Jobs"]);
      expect(affectedRows).toStrictEqual([1, 1, 1, 1]);

      const rs = await client.streamQuery(`SELECT ID, NAME FROM ${table_name}`);
      rs.setFetchSize(1);
      expect(rs).not.toBeUndefined();

      let total = 0;
      for await (const chunk of rs.createObjectStream()) {
        total++;
        expect(chunk.ID).not.toBeUndefined();
        expect(chunk.NAME).not.toBeUndefined();
      }
      expect(total).toBe(4);
      rs.close();

      const rs2 = await client.streamQuery(`SELECT ID, NAME FROM ${table_name}`);
      for await (const rows of rs2.createArrayStream()) {
        expect(rows).toBeInstanceOf(Array);
        rows.forEach(row => {
          expect(row.ID).not.toBeUndefined();
          expect(row.NAME).not.toBeUndefined();
        });
      }
      rs2.close();
    }
  ));
  

});
