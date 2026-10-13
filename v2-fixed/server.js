const express = require('express')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

const db = new sqlite3.Database(':memory:')

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  next()
})

const sesi = {}

function hashPass(p) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(p, 10, (e, h) => (e ? reject(e) : resolve(h)))
  })
}

db.serialize(async () => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)')
  const a = await hashPass('admin123')
  const b = await hashPass('budi123')
  db.run('INSERT INTO users VALUES (1, ?, ?, ?)', ['admin', a, 'admin'])
  db.run('INSERT INTO users VALUES (2, ?, ?, ?)', ['budi', b, 'user'])
})

app.post('/register', async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'isi username sama password' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'password minimal 8 karakter' })
  }

  const hashed = await hashPass(password)

  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashed, 'user'], function (err) {
    if (err) return res.status(500).json({ error: 'gagal daftar' })
    res.json({ ok: true, id: this.lastID })
  })
})

app.post('/login', (req, res) => {
  const { username, password } = req.body

  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'format salah' })
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) return res.status(500).json({ error: 'error' })

    if (!row) {
      return res.status(401).json({ ok: false, error: 'username atau password salah' })
    }

    const cocok = await bcrypt.compare(password, row.password)
    if (!cocok) {
      return res.status(401).json({ ok: false, error: 'username atau password salah' })
    }

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sesi[token] = { id: row.id, role: row.role }

    res.json({ ok: true, token: token })
  })
})

function butuhLogin(req, res, next) {
  const token = req.headers['x-token']
  if (!token || !sesi[token]) {
    return res.status(401).json({ error: 'belum login' })
  }
  req.user = sesi[token]
  next()
}

app.get('/aku', butuhLogin, (req, res) => {
  db.get('SELECT id, username, role FROM users WHERE id = ?', [req.user.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'error' })
    res.json(row)
  })
})

app.get('/user/:id', butuhLogin, (req, res) => {
  const id = parseInt(req.params.id, 10)

  if (isNaN(id)) {
    return res.status(400).json({ error: 'id harus angka' })
  }

  if (req.user.role !== 'admin' && req.user.id !== id) {
    return res.status(403).json({ error: 'gak boleh liat user lain' })
  }

  db.get('SELECT id, username, role FROM users WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'error' })
    if (!row) return res.status(404).json({ error: 'gak ada' })
    res.json(row)
  })
})

app.listen(3000, () => console.log('jalan di 3000'))
