# Identity Access API Contract

## Sign Up

### Endpoint

- Method: `POST`
- Path: `/auth/signup`

### Request Body

All fields are required.

- `first_name`: string
- `second_name`: string
- `login`: string, uniqueness is enforced by backend
- `email`: string, pattern `^\S+@\S+$`
- `password`: string
- `phone`: string, pattern `^((8|+7)[- ]?)?((?\d{3})?[- ]?)?[\d- ]{7,10}$`

```json
{
  "first_name": "string",
  "second_name": "string",
  "login": "string",
  "email": "string",
  "password": "string",
  "phone": "string"
}
```

### Success Response

- Status: `200 OK`
- Meaning: created user id

```json
{
  "id": 0
}
```

### Error Responses

- `400 Bad Request`

```json
{
  "reason": "string"
}
```

- `401 Unauthorized`
  Swagger does not document the response body.

- `500 Unexpected Error`
  Swagger does not document the response body.

### Known Limits

- Swagger documents only created user id in the Success response.
- Swagger does not document field-level validation errors.
- Swagger does not document response bodies for `401` and `500`.

## Sign In

### Endpoint

- Method: `POST`
- Path: `/auth/signin`

### Request Body

All fields are required.

- `login`: string
- `password`: string

```json
{
  "login": "string",
  "password": "string"
}
```

### Success Response

- Status: `200 OK`
- Meaning: sign-in accepted
- Session: backend sets a session cookie

Swagger does not document the response body. Frontend does not use the response body for
session storage.

### Session Handling

- Backend owns session persistence through a cookie.
- Frontend must not store auth tokens in `localStorage` or `sessionStorage`.
- Sign-in success is determined by successful `200 OK` response.
- Cross-origin auth requests that rely on cookies must use credentials.
- Future session restore should be implemented through a cookie-backed current session endpoint.

### Error Responses

- `400 Bad Request`

```json
{
  "reason": "string"
}
```

- `401 Unauthorized`
  Swagger does not document the response body.

- `500 Unexpected Error`
  Swagger does not document the response body.

### Known Limits

- Swagger does not document the `200 OK` response body.
- Swagger does not document the session cookie attributes.
- Swagger does not document the current session restore endpoint.
- Swagger does not document field-level validation errors.
- Swagger does not document response bodies for `401` and `500`.
