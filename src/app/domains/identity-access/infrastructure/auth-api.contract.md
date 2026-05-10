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
