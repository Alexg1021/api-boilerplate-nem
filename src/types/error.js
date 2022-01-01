class CustomError extends Error {
  status;
  constructor(message) {
    super(message);

    this.name = this.constructor.name;
  }
}

export class InvalidInputError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = 400;
  }
}

export class NotFoundError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = status || 404;
  }
}

export class UnauthenticatedError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = 401;
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = 403;
  }
}

export class ResourceExistsError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = 409;
  }
}

export class UnhandledError extends CustomError {
  constructor(message, error) {
    super(message, error);
    this.error = error;

    this.status = this.status || 500;
  }
}
