import { HDBClient } from "../src";
import { get_db_options } from "./utils";

describe("Basic Test Suite", () => {

  it("should support connect to database and query dummy", async () => {
    expect(get_db_options().host).not.toBeUndefined();
    const client = new HDBClient(get_db_options());
    const rows = await client.execQuery<{LABEL_ONE: number}>("SELECT 1 AS LABEL_ONE FROM DUMMY");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveProperty("LABEL_ONE");
    expect(rows[0].LABEL_ONE).toBe(1);
    client.close();
  });
 
});
