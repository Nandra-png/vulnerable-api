# vulnerable-api

jadi ini projek pertama saya waktu belajar security, saya bikin api login pake express terus saya cobain sendiri apa yang terjadi kalo kodenya ditulis asal, ternyata bisa dibobol, nah repo ini isinya 2 folder yaitu v1 yang sengaja saya bikin bolong dan v2 yang udah saya benerin, saya taro dua duanya biar keliatan bedanya

saya bukan orang security, saya cuma mahasiswa yang penasaran kenapa dosen saya selalu bilang "jangan concat query", jadi saya coba sendiri

## isinya apa aja

ada 2 folder:

**v1-old** ini versi jeleknya, sengaja saya tulis gimana adanya

**v2-fixed** ini versi yang udah dibenerin

## cara jalanin

```
npm install
```

terus mau yang mana

```
npm run old
```

atau

```
npm run fixed
```

dua duanya jalan di port 3000

## apa aja yang bolong di v1

### 1. sql injection

kodenya kayak gini

```js
const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"
```

saya cobain masukin username `admin' --` ternyata langsung masuk sebagai admin tanpa tau passwordnya, soalnya tanda `--` itu jadi komentar di sql, jadi bagian cek password nya hilang

penyebabnya karena saya gabungin langsung input user ke dalem query, jadi user bisa nulis sql sendiri

### 2. password gak di hash

di v1 passwordnya saya simpen apa adanya, `admin123` ya tersimpan `admin123`, jadi siapapun yang bisa liat database langsung tau semua password orang

ini bahaya banget sih kalo sampe bocor, soalnya orang biasa pake password yang sama di banyak tempat

### 3. gak ada login sama sekali

endpoint `/user-old/:id` itu gak cek apa apa, tinggal ganti id nya jadi 2, jadi 3, bisa keliling semua data orang, saya baru tau ini ada namanya IDOR (Insecure Direct Object Reference), keliatannya sepele tapi banyak yang kena

## yang saya benerin di v2

**sql injection** saya ganti pake parameter, jadi inputnya dipisah dari query nya

```js
db.get('SELECT * FROM users WHERE username = ?', [username], ...)
```

**password** sekarang saya hash pake bcrypt, dan pas login saya pake `bcrypt.compare` bukan disamain langsung

**login** saya bikin token sederhana, tiap request harus bawa header `x-token`, dan kalo mau liat user lain saya cek dulu dia admin apa bukan

**validasi** saya tambahin cek input, jadi kalo id nya bukan angka langsung ditolak 400

**pesan error** saya samain buat username salah sama password salah, soalnya kalo dibedain orang bisa nebak nebak username mana yang ada

## cara ngetes

saya tes pake curl

```
curl -X POST http://localhost:3000/login -H "Content-Type: application/json" -d "{\"username\":\"budi\",\"password\":\"budi123\"}"
```

kalo di v1 coba yang injection

```
curl -X POST http://localhost:3000/login-old -H "Content-Type: application/json" -d "{\"username\":\"admin' --\",\"password\":\"apa aja\"}"
```

di v1 bakal masuk, di v2 bakal ditolak

## yang belum saya kerjain

- tokennya masih saya simpen di memori, kalo server restart hilang semua
- belum ada rate limit, jadi orang bisa brute force sepuasnya
- belum pake jwt, saya masih belom paham bener
- https belum, tapi ini buat lokal doang sih

## yang saya pelajarin

yang paling nempel di kepala saya itu, input user tuh gak boleh dipercaya sama sekali, walopun cuma buat login doang, niatnya cuma bikin login simple eh ternyata malah bikin pintu belakang

terus juga kode yang keliatan bener belum tentu aman, v1 saya jalan kok gak error, gak ada warning apa apa, tapi ya gitu bisa dibobol
