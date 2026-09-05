import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { apiRequestInterceptor } from './api-request.interceptor';
import { httpTimeoutInterceptor } from './http-timeout.interceptor';

import { API_BASE_URL, HTTP_REQUEST_TIMEOUT_MS } from '@core/tokens';

const mockBaseUrl = 'https://api.example.test';

describe('apiRequestInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiRequestInterceptor])),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: mockBaseUrl,
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('prefixes a relative path with the API base url', () => {
    httpClient.get('/auth/user').subscribe();

    const request = httpTestingController.expectOne(`${mockBaseUrl}/auth/user`);

    request.flush(null);
  });

  it('sends credentials with every API request', () => {
    httpClient.post('/auth/signup', {}).subscribe();

    const request = httpTestingController.expectOne(`${mockBaseUrl}/auth/signup`);

    expect(request.request.withCredentials).toBe(true);

    request.flush(null);
  });

  it('leaves an absolute url untouched', () => {
    const absoluteUrl = 'https://other.example.test/assets/config.json';

    httpClient.get(absoluteUrl).subscribe();

    const request = httpTestingController.expectOne(absoluteUrl);

    expect(request.request.withCredentials).toBe(false);

    request.flush(null);
  });
});

describe('the interceptor chain of the application', () => {
  const mockTimeoutMs = 10_000;

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiRequestInterceptor, httpTimeoutInterceptor])),
        provideHttpClientTesting(),
        {
          provide: API_BASE_URL,
          useValue: mockBaseUrl,
        },
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

  it('sends an API request with both the base url and the shared timeout', () => {
    httpClient.get('/auth/user').subscribe();

    const request = httpTestingController.expectOne(`${mockBaseUrl}/auth/user`);

    expect(request.request.withCredentials).toBe(true);
    expect(request.request.timeout).toBe(mockTimeoutMs);

    request.flush(null);
  });
});
