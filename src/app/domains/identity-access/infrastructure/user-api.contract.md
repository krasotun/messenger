# Identity Access User API Contract

## Update Profile

### Endpoint

- Method: `PUT`
- Path: `/user/profile`
- Credentials: request must include cookies through `withCredentials: true`

### Request Body

All fields are required.

- `first_name`: string
- `second_name`: string
- `display_name`: string
- `login`: string
- `email`: string
- `phone`: string

```json
{
  "first_name": "string",
  "second_name": "string",
  "display_name": "string",
  "login": "string",
  "email": "string",
  "phone": "string"
}
```

### Success Response

- Status: `200 OK`
- Meaning: user profile has been updated

```json
{
  "id": 0,
  "first_name": "string",
  "second_name": "string",
  "display_name": "string",
  "login": "string",
  "email": "string",
  "phone": "string",
  "avatar": "string"
}
```

### Session Handling

- Update profile requires an active backend session.
- Backend owns session persistence through a cookie.
- Frontend must use the returned `CurrentUserDTO` as the source of updated current user state.
- Frontend must not derive updated current user state from the request body.

### Error Responses

- `400 Bad Request`

```json
{
  "reason": "string"
}
```

- `401 Unauthorized`
  Active session is absent or invalid.

- `500 Unexpected Error`
  Swagger does not document the response body.

### Known Limits

- Swagger does not document whether `display_name` and `avatar` can be `null`.
- Swagger does not document field-level validation errors.
- Swagger does not document whether `login` uniqueness conflict has a dedicated status code.
- Swagger does not document response bodies for `401` and `500`.
