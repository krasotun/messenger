import { AuthFlowStatus } from './auth-flow-status.type';
import { createAuthFlowState } from './create-auth-flow-state';

describe('createAuthFlowState', () => {
  let state: ReturnType<typeof createAuthFlowState>;

  beforeEach(() => {
    state = createAuthFlowState();
  });

  describe('initial state', () => {
    it('should create initial idle state', () => {
      expect(state.status()).toBe(AuthFlowStatus.Idle);
    });

    it('isSubmitting should be false', () => {
      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('startSubmitting', () => {
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
    it('should set error status', () => {
      state.startSubmitting();

      state.markError();

      expect(state.status()).toBe(AuthFlowStatus.Error);
    });

    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.markError();

      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('reset', () => {
    it('should set status to Idle', () => {
      state.startSubmitting();

      state.reset();

      expect(state.status()).toBe(AuthFlowStatus.Idle);
    });

    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.reset();

      expect(state.isSubmitting()).toBe(false);
    });
  });
});
