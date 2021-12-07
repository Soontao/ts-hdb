/* eslint-disable max-len */
import dotenv from "dotenv";
import { Readable } from "stream";
import * as uuid from "uuid";
import { HDBClient } from "../src";
import { HDBClientOption } from "../src/types";

dotenv.config(); // load test env

export const get_db_options = (): HDBClientOption => {
  return {
    host: process.env.TEST_HC_HOST,
    port: parseInt(process.env.TEST_HC_PORT),
    user: process.env.TEST_HC_USER,
    password: process.env.TEST_HC_PASSWORD,
    useTLS: true,
    timeout: 30 * 1000
  };
};

export const random_str = () => {
  return uuid.v4().split("-")[0];
};

export const random_table_name = () => `test_table_${random_str()}z`.toLowerCase();

export const random_proc_name = () => `test_proc_${random_str()}z`.toLowerCase();

export const random_blob_readable_stream = () => {
  const content = uuid.v4();
  const buffer = Buffer.from(content, "utf-8");
  const stream = buffer_to_stream(buffer);
  return {
    content, stream, buffer
  };
};

export const buffer_to_stream = (buf: Buffer) => {
  return new Readable({
    read() {
      this.push(buf);
      this.push(null);
    }
  });
};

export const run_with_client = async(runner: (client: HDBClient) => Promise<void>) => {
  const client = new HDBClient(get_db_options());
  try {
    await runner(client);
  } finally {
    await client.disconnect();    
    client.close();
  }
};

export const run_with_table = async (table_def: Record<string, string>, runner: (client: HDBClient, table_name: string) => Promise<void>) => {
  return run_with_client(async (client) => {
    const table_name = random_table_name();
    try {
      await client.exec(`CREATE COLUMN TABLE ${table_name} (
        ${Object.entries(table_def).map(([key, value]) => `${key} ${value}`).join(",\n")}
      )`);
      await runner(client, table_name);
    } finally {
      await client.exec(`DROP TABLE ${table_name}`);
    }
  });

};


export const stream_to_buffer = (stream: Readable): Promise<Buffer> => {

  return new Promise<Buffer>((resolve, reject) => {
      
    const _buf = [];

    stream.on("data", chunk => _buf.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(_buf)));
    stream.on("error", err => reject(new Error(`error converting stream - ${err}`)));

  });
}; 
