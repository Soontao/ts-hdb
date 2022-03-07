import { Column, HDBReadableStream } from "./types";


export interface ResultSet<T = any> {

  readonly id: Buffer;

  readonly metadata: Array<Column>;

  readonly closed: boolean;

  readonly finished: boolean;

  readonly fetchSize: number;

  readonly averageRowLength: number;

  readonly readSize: number;

  readonly rowsWithMetadata: any;

  readonly useCesu8: boolean;

  readonly ignoreDefaultLobType: boolean;

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
  createArrayStream(options?: StreamOptions): HDBReadableStream<Array<T>>;

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
