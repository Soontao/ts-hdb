import HDBClient, { NotSupportedOperationError } from "../src";
import { FunctionCode } from "../src/types";
import { get_db_options, random_proc_name } from "./utils";


describe("Procedure Test Suite", () => {
  
  it("should support create & invoke proc statement", async () => {
    const client = new HDBClient(get_db_options());
    const proc_name = random_proc_name();
    
    try {
      
      await client.exec(`create procedure ${proc_name} (in a int, in b int, out c int, out d int, out e DUMMY)
        language sqlscript
        reads sql data 
        as begin
          c = :a + :b;
          d = :a * :b;
          e = select * from DUMMY;
        end
      `);
      
      const stat = await client.prepare<{A: any, B: any}, [{C: any, D: any}, any]>(`call ${proc_name} (?,?,?,?,?)`);
      expect(stat.functionCode).toBe(FunctionCode.DB_PROCEDURE_CALL);
      
      const results = await stat.call({ A: 99, B: 102 });

      expect(results).toHaveLength(2);

      expect(results[0].C).toEqual(201);
      expect(results[0].D).toEqual(10098);

      expect(results[1]).toStrictEqual([{ DUMMY: "X" }]);

      expect(results).not.toBeUndefined();

      // @ts-ignore
      await expect(() => stat.execute({ A: 102, B: 3 })).rejects.toThrow(NotSupportedOperationError);

      await stat.drop();

    } finally {
      await client.exec(`drop procedure ${proc_name}`);
      await client.disconnect();    
      client.close();
    }
  });

  it("should support create & invoke proc directly", async () => {
    const client = new HDBClient(get_db_options());
    const proc_name = random_proc_name();
    
    try {
      await client.exec(`create procedure ${proc_name} (in a int, in b int, out c int, out d int, out e DUMMY)
        language sqlscript
        reads sql data 
        as begin
          c = :a + :b;
          d = :a * :b;
          e = select * from DUMMY;
        end
      `);
      const results = await client.exec(`call ${proc_name} (102,3,?,?,?)`);
      expect(results).not.toBeUndefined();
      expect(Object.keys(results)).toHaveLength(0);
      
    } finally {
      await client.exec(`drop procedure ${proc_name}`);
      await client.disconnect();    
      client.close();
    }
  });

});
