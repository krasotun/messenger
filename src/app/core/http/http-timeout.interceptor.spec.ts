import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { httpTimeoutInterceptor } from './http-timeout.interceptor';

import { HTTP_REQUEST_TIMEOUT_MS } from '@core/tokens';

const mockTimeoutMs = 10_000;

describe('httpTimeoutInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpTimeoutInterceptor])),
        provideHttpClientTesting(),
        {
          provide: HTTP_REQUEST_TIMEOUT_MS,
          useValue: mockTimeoutMs,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('sends a request without its own timeout with the shared one', () => {
    const response = { id: 1 };
    let received: unknown = null;

    httpClient.get('/auth/user').subscribe((value) => {
      received = value;
    });

    const request = httpTestingController.expectOne('/auth/user');

    expect(request.request.timeout).toBe(mockTimeoutMs);

    request.flush(response);

    expect(received).toEqual(response);
  });

  it('keeps the timeout a request declared on its own', () => {
    const ownTimeoutMs = 60_000;

    httpClient.post('/user/profile/avatar', new FormData(), { timeout: ownTimeoutMs }).subscribe();

    const request = httpTestingController.expectOne('/user/profile/avatar');

    expect(request.request.timeout).toBe(ownTimeoutMs);

    request.flush(null);
  });
});
