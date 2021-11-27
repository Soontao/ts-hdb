
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
   * The execution of a prepared statement is similar to the direct statement execution on the client.
   * 
   * The difference is that the first parameter of the exec function is an array with positional parameters. 
   * 
   * In case of named parameters it can also be an parameters object
   * 
   * @param params 
   * 
   * @returns 
   */
  public async exec(...params: Array<any>): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this._statement.exec(params, (err: Error, ...results: Array<any>) => {
        if (err) {
          reject(err);
        } else {
          if (results.length === 1) {
            resolve(results[0]);
          } else {
            resolve(results);
          }
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
