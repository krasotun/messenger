import { resolveControlError } from './resolve-control-error';

describe('resolveControlError', () => {
  it('should return undefined when there are no errors', () => {
    expect(resolveControlError([])).toBeUndefined();
  });

  it('should resolve the required violation', () => {
    expect(resolveControlError([{ kind: 'required' }])).toBe('This field is required');
  });

  it('should resolve the too short violation', () => {
    expect(resolveControlError([{ kind: 'minLength' }])).toBe('Value is too short');
  });

  it('should resolve the too long violation', () => {
    expect(resolveControlError([{ kind: 'maxLength' }])).toBe('Value is too long');
  });

  it('should resolve the invalid format violation', () => {
    expect(resolveControlError([{ kind: 'pattern' }])).toBe('Value has an invalid format');
  });

  it('should resolve the mismatch violation with a paired field', () => {
    expect(resolveControlError([{ kind: 'mismatch' }])).toBe('Values do not match');
  });

  it('should resolve the first violation when there are several', () => {
    expect(resolveControlError([{ kind: 'pattern' }, { kind: 'minLength' }])).toBe(
      'Value has an invalid format',
    );
  });

  it('should resolve an unknown violation to the generic message', () => {
    expect(resolveControlError([{ kind: 'someUnknownViolation' }])).toBe('Value is invalid');
  });
});
