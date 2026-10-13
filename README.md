# vulnerable-api

api login express, sengaja dibikin bolong buat ngetes seberapa gampang dibobol, terus versi yang udah dibenerin ada di folder sebelah

2 folder:
- `v1-old` — versi jelek, concat query, password plaintext, gak ada auth
- `v2-fixed` — versi bener

```
npm install
npm run old
npm run fixed
```

dua duanya port 3000

## v1 celahnya

**sql injection**

```js
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
```

masukin `admin' --` langsung jadi admin, karena `--` bikin sisanya jadi komentar

**password plaintext**

`admin123` disimpen `admin123`, gak di hash sama sekali

**idor**

`/user-old/:id` gak cek apa apa, ganti id jadi 2, 3, 4 keliling data orang

## v2 perbaikannya

**parameterized query**

```js
db.get('SELECT * FROM users WHERE username = ?', [username], ...)
```

**bcrypt**

hash di register, `bcrypt.compare` di login

**token + cek role**

header `x-token` wajib, non-admin cuma bisa liat datanya sendiri

**validasi**

id harus angka, kalo bukan langsung 400

**pesan error disamain**

username salah sama password salah pesannya sama, biar gak bisa dipake nebak username

## tes

```bash
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"budi\",\"password\":\"budi123\"}"
```

```bash
curl -X POST http://localhost:3000/login-old -H "Content-Type: application/json" -d "{\"username\":\"admin' --\",\"password\":\"x\"}"
```

di v1 masuk, di v2 ditolak

## todo

- token masih di memori, restart hilang
- belum ada rate limit
- belum pake jwt
- https belum
