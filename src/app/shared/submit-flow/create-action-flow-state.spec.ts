import { createActionFlowState } from '@shared/submit-flow/create-action-flow-state';

describe('createActionFlowState', () => {
  let state: ReturnType<typeof createActionFlowState>;

  beforeEach(() => {
    state = createActionFlowState();
  });

  describe('markSuccess', () => {
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
});
