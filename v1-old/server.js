const express = require('express')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const db = new sqlite3.Database(':memory:')

db.serialize(() => {
  db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, role TEXT)')
  db.run("INSERT INTO users VALUES (1, 'admin', 'admin123', 'admin')")
  db.run("INSERT INTO users VALUES (2, 'budi', 'budi123', 'user')")
})

app.post('/login-old', (req, res) => {
  const { username, password } = req.body
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'"

  db.get(query, (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    if (!row) return res.status(401).json({ ok: false })
    res.json({ ok: true, user: row })
  })
})

app.get('/user-old/:id', (req, res) => {
  db.get('SELECT * FROM users WHERE id = ' + req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message })
    res.json(row || {})
  })
})

app.listen(3000, () => console.log('jalan di 3000'))
