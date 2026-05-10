const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'client')));
app.use('/admin', express.static(path.join(__dirname, '..', 'frontend', 'admin')));

// Helper to read DB
const readDB = async () => {
    try {
        return await fs.readJson(DB_FILE);
    } catch (err) {
        return { places: {}, plans: [], offers: [], users: [], bookings: [] };
    }
};

// Helper to write DB
const writeDB = async (data) => {
    await fs.writeJson(DB_FILE, data, { spaces: 2 });
};

// --- API Endpoints ---

// Places
app.get('/api/places', async (req, res) => {
    const db = await readDB();
    res.json(db.places);
});

app.post('/api/places', async (req, res) => {
    const db = await readDB();
    const newPlace = req.body;
    const id = newPlace.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    db.places[id] = {
        name: newPlace.name,
        duration: "5 Days / 4 Nights", // Default
        description: newPlace.description,
        images: [newPlace.image, newPlace.image, newPlace.image],
        highlights: ["New Destination", "Expert Guided"],
        plans: ["Custom Adventure"]
    };
    await writeDB(db);
    res.json({ success: true, id });
});

// Plans
app.get('/api/plans', async (req, res) => {
    const db = await readDB();
    res.json(db.plans);
});

app.post('/api/plans', async (req, res) => {
    const db = await readDB();
    db.plans.push(req.body);
    await writeDB(db);
    res.json({ success: true });
});

// Offers
app.get('/api/offers', async (req, res) => {
    const db = await readDB();
    res.json(db.offers);
});

app.post('/api/offers', async (req, res) => {
    const db = await readDB();
    db.offers.push(req.body);
    await writeDB(db);
    res.json({ success: true });
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await readDB();
    
    // Check admin
    if (email === 'admin@traveloop.in' && password === 'admin@traveloop') {
        return res.json({ success: true, role: 'admin' });
    }

    // Check existing users or save as new client
    let user = db.users.find(u => u.email === email);
    if (!user) {
        user = { email, password, role: 'client', createdAt: new Date() };
        db.users.push(user);
        await writeDB(db);
    } else if (user.password !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({ success: true, role: 'client' });
});

// Bookings
app.post('/api/bookings', async (req, res) => {
    const db = await readDB();
    db.bookings.push({ ...req.body, id: Date.now() });
    await writeDB(db);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`-----------------------------------------`);
    console.log(`🚀 Traveloop Server is Live!`);
    console.log(`🏠 Client: http://localhost:${PORT}`);
    console.log(`⚙️  Admin:  http://localhost:${PORT}/admin`);
    console.log(`-----------------------------------------`);
});

// API Endpoints with Logging
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`[API] ${req.method} ${req.url} - ${new Date().toLocaleTimeString()}`);
    }
    next();
});

// Bookings - Fetch all for admin
app.get('/api/bookings', async (req, res) => {
    const db = await readDB();
    res.json(db.bookings);
});
