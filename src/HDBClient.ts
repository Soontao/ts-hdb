/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { Mutex } from "@newdash/newdash/functional/Mutex";
import * as hdb from "hdb";
import { inspect } from "node:util";
import { debuglog } from "util";
import { ResultSet } from "./ResultSet";
import { CUDStatement, DCL, DDL, DMLStatement, DQL, DQLStatement, NoParamMatcher, NoParamStatement, ProceduralStatement, ProcedureStatement, Statement, TransactionStatement } from "./Statement";
import { ExtractArguments, ExtractSelect, HDBClientOption, ReadyState } from "./types";
import { createAsyncStream } from "./utils";

const logger = debuglog("hdb-client");

/**
 * HDB Client
 */
export class HDBClient {

  /**
   * configurations
   */
  #options: HDBClientOption;

  /**
   * mutex lock for single client
   */
  #lock: Mutex = new Mutex();

  /**
   * node-hdb native client
   */
  #client: any;

  constructor(options: HDBClientOption) {
    this.#options = options;
  }

  private async _connect(): Promise<this> {
    if (this.#client === undefined) {
      const release = await this.#lock.acquire();
      if (this.#client === undefined) {
        logger("connecting");
        const client = hdb.createClient(this.#options);
        client.on("error", (err: Error) => {
          logger(`hdb client error: ${inspect(err)}`);
        });
        return new Promise((resolve, reject) => {
          client.connect((err: Error) => {
            if (err) {
              logger(`connect error ${inspect(err)}`);
              reject(err);
            } else {
              logger("connected");
              this.#client = client;
              resolve(this);
            }
            release();
          });
        });

      }

    }
    return this;
  }

  /**
   * read state of connection
   */
  public get readyState(): ReadyState {
    return this.#client?.readyState;
  }

  /**
   * client of connection
   */
  public get clientId(): Buffer {
    return this.#client?.clientId;
  }


  /**
   * Direct statement execution is the simplest way to execute SQL statements.
   * 
   * data definition language, defined table sequence or procedure
   * 
   * @param sql 
   * 
   * @example
   * 
   * ```ts
   * await client.exec('create table t_1 (ID bigint)')
   * ```
   * 
   * 
   */
  public async exec(sql: DDL | TransactionStatement | DCL): Promise<void>;
  /**
   * execute SQL query `SELECT` statements
   * 
   * @param sql 
   * @returns the extracted data, if the column is blob type, will return the `Buffer` object
   * 
   * @example
   * 
   * ```ts
   * await client.exec('select A, B from TEST.NUMBERS order by A') // => [{A:1,B:2},{A:3,B:4}]
   * ```
   *
   */
  public async exec<T extends DQL>(sql: T): Promise<Array<ExtractSelect<T>>>;
  /**
   * execute DML like `INSERT`/`UPDATE`/`DELETE`
   * 
   * @param sql insert/update/delete statement
   * @returns the number of affected rows
   */
  public async exec(sql: CUDStatement): Promise<number>;
  /**
   * call procedure directly
   * 
   * if you want to get the output set, please use the `client.prepare()` and `statement.call()`
   * 
   * @param sql 
   * @returns none, you can not receive any out parameters from direct execution
   * 
   * @example
   * 
   * ```ts
   * await client.exec(`call cal_number (102,3,?,?,?)`); // => empty object
   * ```
   */
  public async exec(sql: ProceduralStatement): Promise<object>;
  public async exec(sql: string): Promise<any>; // fallback
  public async exec(sql: string): Promise<any> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this.#client.exec(sql, (err: Error, result: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * The client returns a statement object which can be executed multiple times
   * 
   * prepare SELECT, INSERT or PROCEDURE 
   * 
   * @param sql 
   * @template ST statement entity type
   * @template P query parameters type
   * @returns 
   * 
   * @example
   * 
   * ```ts
   * await client.prepare('SELECT * FROM DUMMY WHERE DUMMY = ?')
   * await client.prepare('INSERT INTO PERSON VALUES (?,?)')
   * await client.prepare('CALL proc_xxxxx (?,?)')
   * ```
   */
  public async prepare<SQL extends DQL>(sql: SQL): Promise<DQLStatement<ExtractSelect<SQL>, ExtractArguments<SQL>>>;
  public async prepare<SQL extends CUDStatement>(sql: SQL): Promise<DMLStatement<any, ExtractArguments<SQL>>>;
  public async prepare<ST = any, P extends Array<any> = Array<any>>(sql: NoParamMatcher): Promise<NoParamStatement>;
  /**
   * create procedure statement
   * 
   * @template ST parameter type
   * @template P return type
   * @param sql 
   */
  public async prepare<ST = any, P extends Array<any> = Array<any>>(sql: ProceduralStatement): Promise<ProcedureStatement<ST, P>>;
  public async prepare(sql: any) {
    await this._connect();
    return new Promise((resolve, reject) => {
      this.#client.prepare(sql, (err: Error, stat: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Statement(stat));
        }
      });
    });
  }

  /**
   * If you use the execute function of the client or statement instead of the exec function, 
   * a resultSet object is returned in the callback instead of an array of all rows. 
   * 
   * The resultSet object allows you to create an object based row stream or an array based stream of rows which can be piped to an writer object. 
   * 
   * Don't forget to **close** the resultSet if you use the execute function
   * 
   * @param query 
   * @returns 
   */
  public async streamQuery<SQL extends DQL>(query: SQL): Promise<ResultSet<ExtractSelect<SQL>>> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this.#client.execute(query, (err: Error, rs: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rs);
        }
      });
    });
  }

  /**
   * query object stream  
   * 
   * @param query 
   * @returns async object iterator
   * 
   * 
   * @example
   * 
   * ```ts
   * for await (const row of client.streamQueryObject(`SELECT ID, NAME FROM t1`)) {
   *   expect(row.ID).not.toBeUndefined();
   *   expect(row.NAME).not.toBeUndefined();
   * }
   * ```
   * 
   */
  public streamQueryObject<SQL extends DQL>(query: SQL): AsyncIterable<ExtractSelect<SQL>> {
    return createAsyncStream(this, "createObjectStream", [query]);
  }

  /**
   * query object list stream
   * 
   * @param query 
   * @returns async object iterator
   * 
   * @example
   * 
   * ```ts
   * for await (const rows of client.streamQueryObject(`SELECT ID, NAME FROM t1`)) {
   *   expect(rows[0].ID).not.toBeUndefined();
   *   expect(rows[0].NAME).not.toBeUndefined();
   * }
   * ```
   * 
   */
  public streamQueryList<SQL extends DQL>(query: SQL): AsyncIterable<Array<ExtractSelect<SQL>>> {
    return createAsyncStream(this, "createArrayStream", [query]);
  }

  /**
   * set auto commit 
   * 
   * @param autoCommit 
   */
  public async setAutoCommit(autoCommit: boolean) {
    await this._connect();
    this.#client.setAutoCommit(autoCommit);
  }

  /**
   * commit transaction
   * 
   * @returns 
   */
  public async commit(): Promise<void> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this.#client.commit((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  /**
   * rollback transaction
   * 
   * @returns 
   */
  public async rollback(): Promise<void> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this.#client.rollback((err: Error) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  /**
   * disconnect form HANA server
   * 
   * @returns 
   */
  public async disconnect() {
    if (this.#client) {
      return new Promise((resolve, reject) => {
        this.#client.disconnect((err: Error) => {
          if (err) {
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });
    }
  }

  /**
   * close TCP connection
   */
  public close() {
    if (this.#client !== undefined) {
      this.#client.close();
      this.#client = undefined;
    }
  }

}

