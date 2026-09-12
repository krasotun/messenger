import { createAuthFlowState } from './create-auth-flow-state';

describe('createAuthFlowState', () => {
  let state: ReturnType<typeof createAuthFlowState>;

  beforeEach(() => {
    state = createAuthFlowState();
  });

  describe('initial state', () => {
    it('isSubmitting should be false', () => {
      expect(state.isSubmitting()).toBe(false);
    });
  });

  describe('startSubmitting', () => {
    it('isSubmitting should be true', () => {
      state.startSubmitting();

      expect(state.isSubmitting()).toBe(true);
    });
  });

  describe('markSuccess', () => {
    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.markSuccess();

      expect(state.isSubmitting()).toBe(false);
    });

    it('should emit succeeded$ once to a subscriber present at the time', () => {
      const succeededSpy = vi.fn();
      state.succeeded$.subscribe(succeededSpy);

      state.markSuccess();

      expect(succeededSpy).toHaveBeenCalledOnce();
    });

    it('should not replay succeeded$ to a subscriber that joins later', () => {
      state.markSuccess();

      const succeededSpy = vi.fn();
      state.succeeded$.subscribe(succeededSpy);

      expect(succeededSpy).not.toHaveBeenCalled();
    });
  });

  describe('markError', () => {
    it('should reset isSubmitting', () => {
      state.startSubmitting();

      state.markError();

      expect(state.isSubmitting()).toBe(false);
    });

    it('should not emit succeeded$', () => {
      const succeededSpy = vi.fn();
      state.succeeded$.subscribe(succeededSpy);

      state.startSubmitting();
      state.markError();

      expect(succeededSpy).not.toHaveBeenCalled();
    });
  });
});
