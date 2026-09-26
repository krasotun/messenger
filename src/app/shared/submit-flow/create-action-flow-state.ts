import { Subject } from 'rxjs';

export const createActionFlowState = () => {
  const succeeded = new Subject<void>();

  const markSuccess = () => {
    succeeded.next();
  };

  return {
    succeeded$: succeeded.asObservable(),
    markSuccess,
  };
};
