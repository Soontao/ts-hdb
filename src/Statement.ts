/* eslint-disable max-len */
import { NotSupportedOperationError } from "./errors";
import { ResultSet } from "./ResultSet";
import { FunctionCode, NotEmptyArray } from "./types";

export class Statement<T = any, P extends Array<any> = Array<any>> {
  
  private _statement: any;

  /**
   * @private
   * @internal
   * @param statement 
   */
  constructor(statement: any) {
    this._statement = statement;
  }

  /**
   * get statement id
   */
  public get id(): Buffer {
    return this?._statement?.id;
  }

  /**
   * get functionCode
   */
  public get functionCode(): FunctionCode {
    return this?._statement.functionCode;
  }
  
  /**
   * direct execute write
   * 
   * @param params each param item will contain an array, each item could be inserted to table
   * @returns affectedRows array
   * 
   * 
   * @example
   * ```ts
   * const affectedRows = await stat.write([1, "Theo"], [2, "Neo"], [3, "Nano"]);
   * expect(affectedRows).toStrictEqual([1, 1, 1]);
   * ```
   * 
   */
  public async write<PA extends NotEmptyArray<P>>(...params: PA): Promise<{[key in keyof PA]: number}>
  /**
   * direct execute write
   * 
   * @param params 
   * 
   * @example
   * ```ts
   * const affectedRows = await stat.write([1, "Theo"]);
   * expect(affectedRows).toStrictEqual(1);
   * ```
   */
  public async write(...params: P): Promise<number>
  public async write(...params: any) {
    return new Promise((resolve, reject) => {
      this._statement.exec(params, (err: Error, results: Array<any>) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * execute statement directly, return result if applicable
   * 
   * @param params 
   * @returns 
   */
  public async exec(...params: P): Promise<T> {
    return new Promise((resolve, reject) => {
      this._statement.exec(params, (err: Error, results: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * direct execute query
   * 
   * @param params 
   * @returns query result
   */
  public async query(...params: P): Promise<Array<T>> {
    return new Promise((resolve, reject) => {
      this._statement.exec(params, (err: Error, results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * call proc directly
   * 
   * ref the [document](https://github.com/SAP/node-hdb#calling-stored-procedures)
   * 
   * @param param 
   * param map, 
   * for example, 
   * a proc have 3 `in` params: `A,B,C`, 
   * the input param should have this format `{A:1,B:2,C:3}`
   * 
   * @returns 
   * out parameters array, 
   * the plain type will be converted as map and stored in the first item
   * and other `table type` out parameters will be appended to the results array
   */
  public async call(param: T): Promise<P> {
    return new Promise((resolve, reject) => {
      this._statement.exec(param, (err: Error, ...results: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  /**
   * drop the prepared statement
   * 
   * @returns 
   */
  public async drop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._statement.drop((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  /**
   * execute query with result set, in stream mode
   * 
   * @param params 
   * @returns result set
   * @throws {NotSupportedOperationError}
   */
  public async streamQuery(...params: P): Promise<ResultSet<T>> {
    // currently, node-hdb do not convert table type out parameter to result set
    if (this.functionCode === FunctionCode.DB_PROCEDURE_CALL) {
      throw new NotSupportedOperationError(`not support to use 'execute' method to call procedure`);
    }
    return new Promise((resolve, reject) => {
      this._statement.execute(params, (err: Error, rs: ResultSet) => {
        if (err) {
          reject(err);
        } else {
          resolve(rs);
        }
      });
    });
  }

  // TODO streamQueryObject/streamQueryList for prepared statement

}

type CommonMethod = "id" | "drop" | "functionCode"

type TransactionKeyword = "commit" | "rollback" | "lock table" | "set transaction" | "savepoint" | "release savepoint"

type CUDKeyword = "insert" | "update" | "upsert" | "delete"

type DMLKeyword = CUDKeyword | "load" | "unload" | "truncate" 

export type DQLKeyword = "select"

type NoParamKeyword = "commit" | "rollback"

/**
 * @private
 * @internal
 */
type DDLKeyword = "create" | "drop" | "alter" | "comment" | "annotate" | "rename" | "refresh"

type DCLKeyword = "grant" | "deny" | "revoke" | "backup"

export type ProceduralStatement = `${"call" | "CALL"}${any}`

/**
 * transaction related statements
 */
export type TransactionStatement = `${TransactionKeyword | Uppercase<TransactionKeyword>}${any}`

/**
 * subset of Data Manipulation Language
 * 
 * only contains INSERT/UPDATE/DELETE/
 */
export type CUDStatement = `${CUDKeyword | Uppercase<CUDKeyword>}${any}`

/**
 * Data Manipulation Language
 */
export type DML = `${DMLKeyword | Uppercase<DMLKeyword>}${any}`

/**
 * Data Query Language
 */
export type DQL = `${DQLKeyword | Uppercase<DQLKeyword>}${any}`

/**
 * Data Definition Language
 */
export type DDL = `${DDLKeyword | Uppercase<DDLKeyword>}${any}`

/**
 * Data Control Language
 */
export type DCL = `${DCLKeyword | Uppercase<DCLKeyword>}${any}`

/**
 * no params statements
 */
export type NoParamMatcher = `${NoParamKeyword | Uppercase<NoParamKeyword>}${any}`

/**
 * execute procedure
 */
export type ProcedureStatement<T, P extends Array<any>> = Pick<Statement<T, P>, CommonMethod | "call">
/**
 * no param statement
 */
export type NoParamStatement = Pick<Statement<void, []>, CommonMethod | "exec">
/**
 * perform INSERT/UPDATE/DELETE
 */
export type DMLStatement<T, P extends Array<any>> = Pick<Statement<T, P>, CommonMethod | "write">
/**
 * perform SELECT query
 */
export type DQLStatement<T, P extends Array<any>> = Pick<Statement<T, P>, CommonMethod | "streamQuery" | "query">

