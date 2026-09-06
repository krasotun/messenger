import { InjectionToken } from '@angular/core';

import { Notifier } from './notifier';

export const NOTIFIER = new InjectionToken<Notifier>('NOTIFIER');
