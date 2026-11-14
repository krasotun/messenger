import { resolveViolationMessage } from './resolve-violation-message';

describe('resolveViolationMessage', () => {
  it('should return undefined when there are no errors', () => {
    expect(resolveViolationMessage([])).toBeUndefined();
  });

  it('should resolve the required violation', () => {
    expect(resolveViolationMessage([{ kind: 'required' }])).toBe('This field is required');
  });

  it('should resolve the too short violation', () => {
    expect(resolveViolationMessage([{ kind: 'minLength' }])).toBe('Value is too short');
  });

  it('should resolve the too long violation', () => {
    expect(resolveViolationMessage([{ kind: 'maxLength' }])).toBe('Value is too long');
  });

  it('should resolve the invalid format violation', () => {
    expect(resolveViolationMessage([{ kind: 'pattern' }])).toBe('Value has an invalid format');
  });

  it('should resolve the mismatch violation with a paired field', () => {
    expect(resolveViolationMessage([{ kind: 'mismatch' }])).toBe('Values do not match');
  });

  it('should resolve the first violation when there are several', () => {
    expect(resolveViolationMessage([{ kind: 'pattern' }, { kind: 'minLength' }])).toBe(
      'Value has an invalid format',
    );
  });

  it('should resolve an unknown violation to the generic message', () => {
    expect(resolveViolationMessage([{ kind: 'someUnknownViolation' }])).toBe('Value is invalid');
  });
});
