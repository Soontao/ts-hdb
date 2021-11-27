
export class Statement {
  
  private _statement: any;

  /**
   * @private
   * @internal
   * @param statement 
   */
  constructor(statement: any) {
    this._statement = statement;
  }

  public get id() {
    return this?._statement?.id;
  }

  /**
   * 
   * @param params affectedRows array
   * @returns 
   */
  public async write(...params: Array<any>): Promise<Array<Array<number>>> {
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
   * 
   * @param params 
   * @returns query result
   */
  public async query<T = any>(...params: Array<any>): Promise<Array<T>> {
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
   * call proc
   * 
   * ref the [document](https://github.com/SAP/node-hdb#calling-stored-procedures)
   * 
   * @param param param map
   * @returns out parameters array
   */
  public async call(param: any): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this._statement.exec(param, (err: Error, ...results: Array<any>) => {
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
  public async drop() {
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

}
