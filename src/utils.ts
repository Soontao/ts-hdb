import { Mutex } from "@newdash/newdash/functional/Mutex";
import { ResultSet } from "./ResultSet";

export const createAsyncStream = <T>(
  ctx: any, 
  streamMethod: "createObjectStream" | "createArrayStream",
  params: any
): AsyncIterable<T> => {
  let stream = undefined;
  let rs: ResultSet<T> = undefined;
  const mut = new Mutex();
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          if (stream === undefined) {
            const release = await mut.acquire();
            if (stream === undefined) {
              rs = await ctx.streamQuery(...params);
              stream = rs[streamMethod]();
            }
            release();
          }
          const rt = await stream[Symbol.asyncIterator]().next();
          if (rt.done === true) {
            rs.close();
          }
          return rt;
        },
      };
    }
  };
};
