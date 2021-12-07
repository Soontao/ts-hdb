import { Readable } from "stream";
import { Column } from "./types";


interface HDBReadableStream<T = any> extends Readable {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}


export interface ResultSet<T = any> {

  id: Buffer;

  metadata: Array<Column>;

  closed: boolean;

  finished: boolean;

  fetchSize: number;

  averageRowLength: number;

  readSize: number;

  rowsWithMetadata: any;

  useCesu8: boolean;

  ignoreDefaultLobType: boolean;

  /**
   * set fetch size
   * 
   * @default 1024
   * @param size 
   */
  setFetchSize(size: number): void;

  /**
   * setAverageRowLength
   * 
   * @default 64
   * @param length 
   */
  setAverageRowLength(length: number): void;

  /**
   * set lob read size
   * 
   * @default 204800
   * @param size 
   */
  setReadSize(size: number): void;

  /**
   * return a readable stream, each chunk will be an object
   * 
   * @param options 
   */
  createObjectStream(options?: StreamOptions): HDBReadableStream<T>;

  /**
   * return a readable stream, each chunk will be an array of objects
   * 
   * @param options 
   */
  createArrayStream(options?: StreamOptions): HDBReadableStream<T>;

  /**
   * close result set
   */
  close(): void
}


export interface StreamOptions {
  arrayMode?: boolean | number;
  objectMode?: boolean;
  threshold?: number;
}
