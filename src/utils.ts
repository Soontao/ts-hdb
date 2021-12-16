import { Mutex } from "@newdash/newdash/functional/Mutex";
import { ResultSet } from "./ResultSet";

export const createAsyncStream = <T>(
  context: any, 
  streamMethod: "createObjectStream" | "createArrayStream",
  params: any
): AsyncIterable<T> => {
  let stream = undefined;
  let rs: ResultSet<T> = undefined;
  const mutex = new Mutex();
  return {
    [Symbol.asyncIterator]() {
      return {
        async next() {
          if (stream === undefined) {
            const release = await mutex.acquire();
            if (stream === undefined) {
              rs = await context.streamQuery(...params);
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
