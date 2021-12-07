import { FunctionCode } from "../src";
import { run_with_client } from "./utils";


describe("Statement Test Suite", () => {
  
  it("should support prepare for some specific statements",  () => run_with_client(async(client) => {
    
    const commit = await client.prepare("commit");
    expect(commit.functionCode).toBe(FunctionCode.COMMIT);

    const rollback = await client.prepare("rollback");
    expect(rollback.functionCode).toBe(FunctionCode.ROLLBACK);

  }));

});
