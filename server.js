const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

const db = new sqlite3.Database('./chat-app.db');
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, username TEXT UNIQUE, password TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id TEXT, recipient_id TEXT, content TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
    db.run("CREATE TABLE IF NOT EXISTS contacts (user_id TEXT, contact_id TEXT, contact_name TEXT, PRIMARY KEY (user_id, contact_id))");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));

function generateUserId(username) {
    const hash = crypto.createHash('sha256').update(username).digest('hex');
    return hash.substr(0, 5);
}

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = generateUserId(username);
    db.run("INSERT INTO users (id, username, password) VALUES (?, ?, ?)", [id, username, hashedPassword], function(err) {
        if (err) {
            res.status(400).json({ error: 'Username already exists' });
        } else {
            res.json({ success: true, userId: id });
        }
    });
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err || !user || !await bcrypt.compare(password, user.password)) {
            res.status(400).json({ error: 'Invalid username or password' });
        } else {
            req.session.userId = user.id;
            res.json({ success: true, userId: user.id });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.post('/api/send-message', (req, res) => {
    const { content, recipientId } = req.body;
    const senderId = req.session.userId;
    if (!senderId) return res.status(401).json({ error: 'Unauthorized' });

    db.run("INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)", [senderId, recipientId, content], function(err) {
        if (err) {
            res.status(500).json({ error: 'Failed to send message' });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/messages/:contactId', (req, res) => {
    const userId = req.session.userId;
    const contactId = req.params.contactId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.all(
        "SELECT sender_id, content, timestamp FROM messages WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?) ORDER BY timestamp ASC",
        [userId, contactId, contactId, userId],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: 'Failed to retrieve messages' });
            } else {
                res.json(rows);
            }
        }
    );
});

app.post('/api/add-contact', (req, res) => {
    const userId = req.session.userId;
    const { contactId, contactName } = req.body;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.run("INSERT INTO contacts (user_id, contact_id, contact_name) VALUES (?, ?, ?)", [userId, contactId, contactName], function(err) {
        if (err) {
            res.status(500).json({ error: 'Failed to add contact' });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/contacts', (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.all("SELECT contact_id as id, contact_name as name FROM contacts WHERE user_id = ?", [userId], (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Failed to retrieve contacts' });
        } else {
            res.json(rows);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
