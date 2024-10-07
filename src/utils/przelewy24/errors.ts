/**
 * Error from Przelewy24
 *
 * @export
 * @class P24Error
 * @extends {Error}
 */
export class P24Error extends Error {
  constructor(error: string, code: number, extra?: unknown) {
    super(`error = ${error}, code = ${code}, extra = ${extra}`); // 'Error' breaks prototype chain here
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
