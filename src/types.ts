import { ConnectionOptions } from "tls";


export interface HDBClientOption extends ConnectionOptions {
  /**
   * @default 1024
   */
  fetchSize?: number;
  /**
   * @default true
   */
  holdCursorsOverCommit?: boolean;
  /**
   * @default true
   */
  scrollableCursor?: boolean;

  /**
   * This is suitable for multiple-host SAP HANA systems which are distributed over several hosts. 
   * The client establishes a connection to the first available host from the list.
   */
  hosts?: Array<ConnectionOptions>;
  /**
   * instance number of the HANA system
   * @example '00'
   */
  instanceNumber?: string;
  user: string;
  password: string;
  /**
   * name of a particular tenant database
   * 
   * @example DB01
   */
  databaseName?: string;
  /**
   * Use the useTLS option if you would like to connect to SAP HANA using Node.js's trusted certificates
   * @default false
   */
  useTLS?: boolean;
  /**
   * If your SQL statement is a join with overlapping column names, you may want to get separate objects for each table per row. 
   * 
   * This is possible if you set option nestTables to TRUE
   * 
   * @default false
   */
  nestTables?: boolean;
  /**
   * It is also possible to return all rows as an array where the order of the column values is exactly the same as in the resultSetMetadata. 
   * In this case you have to set the option rowsAsArray to TRUE:
   * 
   * @default false
   */
  rowsAsArray?: boolean;
  /**
   * The SAP HANA server connectivity protocol uses CESU-8 encoding. Node.js does not support CESU-8 natively and the driver by default converts all text to CESU-8 format in the javascript layer including SQL statements.
   * 
   * Due to the fact that Node.js has built-in support for UTF-8, using UTF-8 in the HDB drivers can lead to performance gains especially for large text data. If you are sure that your data contains only BMP characters, you can disable CESU-8 conversion by setting a flag in the client configuration.
   * 
   * @default true
   */
  useCesu8?: boolean;
}

export type ReadyState = "new" | "open" | "connected" | "closed" | "disconnected"

/**
 * Function Code
 */
export enum FunctionCode {
  NIL = 0,
  DDL = 1,
  INSERT = 2,
  UPDATE = 3,
  DELETE = 4,
  SELECT = 5,
  SELECT_FOR_UPDATE = 6,
  EXPLAIN = 7,
  DB_PROCEDURE_CALL = 8,
  DB_PROCEDURE_CALL_WITH_RESULT = 9,
  FETCH = 10,
  COMMIT = 11,
  ROLLBACK = 12,
  SAVEPOINT = 13,
  CONNECT = 14,
  WRITE_LOB = 15,
  READ_LOB = 16,
  PING = 17,
  DISCONNECT = 18,
  CLOSE_CURSOR = 19,
  FIND_LOB = 20,
  ABAP_STREAM = 21,
  XA_START = 22,
  XA_JOIN = 23, 
}
