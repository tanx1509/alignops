export class DomainError extends Error {
  constructor(
    public readonly code: string,
    public override readonly message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message, 400)
  }
}

export class BusinessRuleViolationError extends DomainError {
  constructor(message: string) {
    super('BUSINESS_RULE_VIOLATION', message, 422)
  }
}

export class StateTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      'INVALID_TRANSITION',
      `Cannot transition goal sheet from '${from}' to '${to}'`,
      422,
    )
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', message, 404)
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message, 403)
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
  }
}

export class ConflictError extends DomainError {
  constructor(message = 'Resource was modified concurrently. Reload and retry.') {
    super('CONFLICT', message, 409)
  }
}

export class SheetLockedError extends DomainError {
  constructor() {
    super(
      'SHEET_LOCKED',
      'Goal sheet is locked and cannot be modified. Contact an administrator.',
      423,
    )
  }
}