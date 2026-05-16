import { AuthFlowStatus } from './auth-flow-status';
import { createAuthFlowState } from './create-auth-flow-state';

const mockError = 'mockError';

describe('createAuthFlowState', () => {
  let state: ReturnType<typeof createAuthFlowState>;

  beforeEach(() => {
    state = createAuthFlowState();
  });

  describe('initial state', () => {
    it('should create initial idle state', () => {
      expect(state.status()).toBe(AuthFlowStatus.Idle);
    });

    it('error message should be empty', () => {
      expect(state.errorMessage()).toBeNull();
    });

    it('isSubmitting should be false', () => {
      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('startSubmitting', () => {
    it('should clear an error', () => {
      state.markError(mockError);

      state.startSubmitting();

      expect(state.errorMessage()).toBeNull();
    });

    it('status should switch to Submitting', () => {
      state.markSuccess();

      state.startSubmitting();

      expect(state.status()).toBe(AuthFlowStatus.Submitting);
    });

    it('isSubmitting should be true', () => {
      state.startSubmitting();

      expect(state.isSubmitting()).toBe(true);
    });
  });

  describe('markSuccess', () => {
    it('should reset error', () => {
      state.markError(mockError);

      state.markSuccess();

      expect(state.errorMessage()).toBeNull();
    });

    it('should set success status', () => {
      state.markSuccess();

      expect(state.status()).toBe(AuthFlowStatus.Success);
    });

    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.markSuccess();

      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('markError', () => {
    it('should set error', () => {
      state.startSubmitting();
      state.markError(mockError);

      expect(state.errorMessage()).toBe('mockError');
    });

    it('should set error status', () => {
      state.startSubmitting();

      state.markError(mockError);

      expect(state.status()).toBe(AuthFlowStatus.Error);
    });

    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.markError(mockError);

      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should set status to Idle', () => {
      state.startSubmitting();

      state.reset();

      expect(state.status()).toBe(AuthFlowStatus.Idle);
    });

    it('should reset error', () => {
      state.startSubmitting();

      state.markError(mockError);

      state.reset();

      expect(state.errorMessage()).toBeNull();
    });

    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.reset();

      expect(state.isSubmitting()).toBe(false);
    });
  });
});
