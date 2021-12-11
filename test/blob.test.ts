import HDBClient from "../src";
import { get_db_options, random_blob_readable_stream, random_table_name, stream_to_buffer } from "./utils";


describe("Blob Related Test Suite", () => {
  
  it("should support update Blob", async () => {
    const client = new HDBClient(get_db_options());
    const table_name = random_table_name();
    await client.exec(`CREATE COLUMN TABLE ${table_name} (ID BIGINT NOT NULL, CONTENT BLOB)`);
    
    try {
      const stat = await client.prepare(`INSERT INTO ${table_name} VALUES (?,?)`);
      const random_value = random_blob_readable_stream();
      const affected = await stat.write([1, random_value.stream]);
      expect(affected).toBe(1);
      
      // if direct query, will extract to buffer directly
      const rows = await client.exec(`SELECT ID, CONTENT FROM ${table_name} WHERE ID = 1`);
      expect(rows).toHaveLength(1);
      expect(rows[0].CONTENT).toStrictEqual(random_value.buffer);

      const another_random_value = random_blob_readable_stream();
      const another_affected = await stat.write([2, another_random_value.stream]);
      expect(another_affected).toBe(1);

      const query_stat = await client.prepare(`SELECT ID, CONTENT FROM ${table_name} WHERE ID = ?`);
      const query_rs = await query_stat.streamQuery(2);

      for await (const row of query_rs.createObjectStream()) {
        expect(row.ID).not.toBeUndefined();
        expect(row.CONTENT).not.toBeUndefined();
        const content_buff = await stream_to_buffer(row.CONTENT.createReadStream());
        expect(content_buff).toStrictEqual(another_random_value.buffer);
      }

      query_rs.close();

    } finally {
      await client.exec(`DROP TABLE ${table_name}`);
      await client.disconnect();    
      client.close();
    }
  });

});
