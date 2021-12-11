/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Readable } from "stream";
import { ConnectionOptions } from "tls";
import { DQLKeyword } from "./Statement";


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


export interface HDBReadableStream<T = any> extends Readable {
  [Symbol.asyncIterator](): AsyncIterableIterator<T>;
}


// >> ref https://stackoverflow.com/a/68695508/4380476
type UnionToIntersection<U> =
(U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never
type LastOf<T> =
UnionToIntersection<T extends any ? () => T : never> extends () => (infer R) ? R : never

// TS4.0+
type Push<T extends any[], V> = [...T, V];

// TS4.1+
type TupleUnion<T, L = LastOf<T>, N = [T] extends [never] ? true : false> =
true extends N ? [] : Push<TupleUnion<Exclude<T, L>>, L>

export type ObjValueTuple<T, KS extends any[] = 
TupleUnion<keyof T>, R extends any[] = []> =
KS extends [infer K, ...infer KT]
  ? ObjValueTuple<T, KT, [...R, T[K & keyof T]]>
  : R;

export type TrimSpace<T> = T extends ` ${infer Rest}` ? T extends `${infer Rest} ` ? TrimSpace<Rest> : 
  TrimSpace<Rest> : 
  T;

/**
 * "Id" => Id
 * Id => ID
 */
export type ExtractIdentifier<Target extends string> = Target extends `"${infer inner}"` ? inner : Uppercase<Target>;

export type ExtractAs<Target extends string> = Target extends `${infer _}${"as" | "AS"}${infer id}` ? TrimSpace<id> : Target;

export type ExtractColumns<Target extends string, Delimiter extends string = ","> = Target extends `${infer v1}${Delimiter}${infer v2}` ? 
  ExtractColumns<v1, Delimiter> | ExtractColumns<TrimSpace<v2>, Delimiter>: ExtractIdentifier<ExtractAs<Target>>;


/**
 * @example
 * ```ts
 * ExtractSelect<'select "Id", NAME as P_NAME from t'> // => {Id:any,P_NAME:any}
 * ```
 */
export type ExtractSelect<Sql extends string> = Sql extends `${DQLKeyword | Uppercase<DQLKeyword>}${infer parts}${"from" | Uppercase<"FROM">}${any}` ? 
  TupleToObject<ExtractColumns<TrimSpace<parts>>>
  :never;


/**
 * @example
 * 
 * ```ts
 * ExtractArguments<"Select a from b where c = ?, b = ?"> // => [any,any]
 * ```
 */
export type ExtractArguments<Sql extends string> = Sql extends `${infer v1}?${infer v2}` ? [
  ...ExtractArguments<v1>,
  any,
  ...ExtractArguments<v2>,
] : [] 

type TupleToObject<T extends string> = { [key in T]: any; }

export type NotEmptyArray<T> = [T, ...T[]]

// <<

/**
 * HDB Data Type
 */
export enum DataType {
  NULL = 0, TINYINT, SMALLINT, INT, BIGINT, DECIMAL, REAL, DOUBLE, 
  CHAR, VARCHAR, NCHAR, NVARCHAR, 
  BINARY, VARBINARY, DATE, TIME, TIMESTAMP,
  CLOB = 25, NCLOB, BLOB, BOOLEAN, 
  STRING, NSTRING, BLOCATOR, NLOCATOR, BSTRING,
  ABAPITAB = 48, ABAPSTRUCT, ARRAY, TEXT, SHORTTEXT,
  ALPHANUM = 55, TLOCATOR, LONGDATE, SECONDDATE, DAYDATE, SECONDTIME
}

/**
 * HDB Column Metadata
 */
export interface Column {
  columnDisplayName: string;
  columnName: string;
  dataType: DataType;
  fraction: number;
  length: number;
  mode: number;
  schemaName?: string
  tableName: string;
}

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

