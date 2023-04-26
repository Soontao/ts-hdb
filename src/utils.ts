import { ResultSet } from "./ResultSet";

export async function* createAsyncStream<T>(
  context: any,
  streamMethod: "createObjectStream" | "createArrayStream",
  params: any
): AsyncIterable<T> {
  const rs: ResultSet<T> = await context.streamQuery(...params);
  const stream = rs[streamMethod]();
  for await (const rt of stream) {
    yield rt as any;
  }
};
