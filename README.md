# vulnerable-api

Express login API, intentionally left insecure. Fixed version sits next to it.

Two folders:

- `v1-old` — string-concatenated queries, plaintext passwords, no auth
- `v2-fixed` — hardened version

```
npm install
npm run old
npm run fixed
```

Both run on port 3000.

## v1 flaws

**SQL injection**

```js
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
```

Post `admin' --` and you're in as admin. The `--` comments out the password check.

**Plaintext passwords**

`admin123` stored as `admin123`. No hashing at all.

**IDOR**

`/user-old/:id` has no ownership check. Increment the id and you walk through everyone's data.

## v2 fixes

**Parameterized queries**

```js
db.get('SELECT * FROM users WHERE username = ?', [username], ...)
```

**bcrypt**

Hash on register, `bcrypt.compare` on login.

**Token + role check**

Requires `x-token` header. Non-admins can only read their own record.

**Input validation**

Id must parse as integer, otherwise 400.

**Matching error messages**

Wrong username and wrong password return the same message so usernames can't be enumerated.

## Test

```bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"budi\",\"password\":\"budi123\"}"
```

```bash
curl -X POST http://localhost:3000/login-old -H "Content-Type: application/json" -d "{\"username\":\"admin' --\",\"password\":\"x\"}"
```

First one fails on v1, passes on v2. Second one succeeds on v1, fails on v2.

## Todo

- sessions held in memory, lost on restart
- no rate limiting
- no JWT yet
- no HTTPS
