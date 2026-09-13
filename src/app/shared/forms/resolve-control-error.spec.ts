import { resolveControlError } from './resolve-control-error';

describe('resolveControlError', () => {
  it('should return undefined when there are no errors', () => {
    expect(resolveControlError(null)).toBeUndefined();
  });

  it('should resolve the required violation', () => {
    expect(resolveControlError({ required: true })).toBe('This field is required');
  });

  it('should resolve the too short violation', () => {
    expect(resolveControlError({ minlength: { requiredLength: 10, actualLength: 3 } })).toBe(
      'Value is too short',
    );
  });

  it('should resolve the too long violation', () => {
    expect(resolveControlError({ maxlength: { requiredLength: 10, actualLength: 20 } })).toBe(
      'Value is too long',
    );
  });

  it('should resolve the invalid format violation', () => {
    expect(resolveControlError({ pattern: { requiredPattern: '', actualValue: '' } })).toBe(
      'Value has an invalid format',
    );
  });

  it('should resolve the mismatch violation with a paired field', () => {
    expect(resolveControlError({ mismatch: true })).toBe('Values do not match');
  });

  it('should resolve an unknown violation to the generic message', () => {
    expect(resolveControlError({ someUnknownViolation: true })).toBe('Value is invalid');
  });
});
