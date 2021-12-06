import { Readable } from "stream";


interface HDBReadableStream<T = any> extends Readable {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}


export interface ResultSet<T = any> {
  setFetchSize(size: number): void;
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
   * @param options 
   */
  createReadStream(options?: StreamOptions): HDBReadableStream;
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
