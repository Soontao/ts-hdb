/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */

import { Mutex } from "@newdash/newdash";
import { debug } from "debug";
import * as hdb from "hdb";
import { ResultSet } from "./ResultSet";
import { CUDStatement, DCL, DDL, DMLStatement, DQL, DQLStatement, NoParamMatcher, NoParamStatement, ProceduralStatement, ProcedureStatement, Statement, TransactionStatement } from "./Statement";
import { ExtractSelect, HDBClientOption, ReadyState } from "./types";

const logger = debug("hdb-client");

/**
 * HDB Client
 */
export class HDBClient {

  private _options: HDBClientOption;

  private _lock: Mutex = new Mutex();

  private _client: any;

  constructor(options: HDBClientOption) {
    this._options = options;
  }

  private async _connect(): Promise<this> {
    if (this._client === undefined) {
      const release = await this._lock.acquire();
      if (this._client === undefined) {
        logger("connecting");
        const client = hdb.createClient(this._options);
        client.on("error",  (err: Error) => {
          logger(`network error: ${err}`);
        });
        return new Promise((resolve, reject) => {
          client.connect( (err: Error) => {
            if (err) {
              logger(`connect error ${err.message}`);
              reject(err);
            } else {
              logger("connected");
              this._client = client;
              resolve(this);
            }
            release();
          });
        });
        
      }
     
    }
  }

  /**
   * read state of connection
   */
  public get readyState(): ReadyState {
    return this?._client?.readyState;
  }

  /**
   * client of connection
   */
  public get clientId(): string {
    return this?._client?.clientId;
  }

  /**
   * Direct statement execution is the simplest way to execute SQL statements.
   * 
   * The only input parameter is the SQL command to be executed.
   * 
   * The type of returned result depends on the kind of statement.
   * 
   * @param sql the sql statement
   * @returns affected number for DML and result set for Query
   * 
   * 
   * @example
   * 
   * ```ts
   * await client.exec('create table TEST.NUMBERS (a int, b varchar(16))') // => undefined
   * await client.exec("insert into TEST.NUMBERS values (1, 'one')") // => 1
   * await client.exec('select A, B from TEST.NUMBERS order by A') // => [{A:1,B:2},{A:3,B:4}]
   * ```
   */
  public async exec(sql: DDL | TransactionStatement | DCL): Promise<void>;
  public async exec<T extends DQL>(sql: T): Promise<Array<ExtractSelect<T>>>;
  public async exec(sql: CUDStatement): Promise<number>;
  public async exec(sql: ProceduralStatement): Promise<Array<any>>;
  public async exec(sql: string): Promise<any>; // fallback
  public async exec(sql: string): Promise<any> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this._client.exec(sql, (err: Error, result: any) => {
        if(err) {
          reject(err);
        } else{
          resolve(result);
        }
      });
    });
  }

  /**
   * Direct statement execution with query
   * 
   * @param sql query sQL
   * @returns array of query result
   */
  public async query<T = any>(sql: DQL): Promise<Array<T>> {
    // @ts-ignore
    return this.exec(sql);
  }

  /**
   * Direct statement execution with insert/update/delete
   * 
   * @param sql 
   * @returns 
   */
  public async write(sql: CUDStatement): Promise<number> {
    // @ts-ignore
    return this.exec(sql);
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
  // TODO extract parameters
  public async prepare<SQL extends DQL>(sql: SQL): Promise<DQLStatement<ExtractSelect<SQL>, Array<any>>>;
  public async prepare<ST = any, P extends Array<any> = Array<any>>(sql: CUDStatement): Promise<DMLStatement<ST, P>>;
  public async prepare<ST = any, P extends Array<any> = Array<any>>(sql: NoParamMatcher): Promise<NoParamStatement>;
  public async prepare<ST = any, P extends Array<any> = Array<any>>(sql: ProceduralStatement): Promise<ProcedureStatement< ST, P>>;
  public async prepare(sql: any) {
    await this._connect();
    return new Promise((resolve, reject) => {
      this._client.prepare(sql, (err: Error, stat: any) => {
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
  public async execute<V = any>(query: string): Promise<ResultSet<V>> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this._client.execute(query, (err: Error, rs: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(rs);
        }
      });
    });
  }

  /**
   * set auto commit 
   * 
   * @param autoCommit 
   */
  public async setAutoCommit(autoCommit: boolean) {
    await this._connect();
    this._client.setAutoCommit(autoCommit);
  }

  /**
   * commit transaction
   * 
   * @returns 
   */
  public async commit(): Promise<void> {
    await this._connect();
    return new Promise((resolve, reject) => {
      this._client.commit((err: Error) => {
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
      this._client.rollback((err: Error) => {
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
    if (this._client) {
      return new Promise((resolve, reject) => {
        this._client.disconnect((err: Error) => {
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
   * close tcp connection
   */
  public close() {
    if (this._client) {
      this._client.close();
      delete this._client;
    }
  }

}

