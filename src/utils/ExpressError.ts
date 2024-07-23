export class ExpressError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Set the prototype explicitly to maintain the correct prototype chain
    Object.setPrototypeOf(this, ExpressError.prototype);
    // This step is necessary because TypeScript might not
    // correctly maintain the prototype chain due to how it
    // handles class inheritance and the built-in Error object.
  }
}