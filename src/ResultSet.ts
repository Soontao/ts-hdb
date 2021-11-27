import { Readable } from "stream";


export interface ResultSet {
  setFetchSize(size: number): void;
  /**
   * return a readable stream, each chunk will be an object
   * 
   * @param options 
   */
  createObjectStream(options?: StreamOptions): Readable;
  /**
   * return a readable stream, each chunk will be an array of objects
   * 
   * @param options 
   */
  createArrayStream(options?: StreamOptions): Readable;
  /**
   * @param options 
   */
  createReadStream(options?: StreamOptions): Readable;
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
