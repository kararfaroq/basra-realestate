const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// مشاركة المجلد الرئيسي بالكامل بما يحتويه من css و js وصور
app.use(express.static(path.join(__dirname, '..')));

// مسار جلب البيانات الحية من قاعدة بيانات Neon
app.get('/api/get-data', async (req, res) => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    const listingsResult = await client.query('SELECT * FROM listings ORDER BY created_at DESC');
    const officesResult = await client.query('SELECT * FROM offices ORDER BY id DESC');
    await client.end();

    res.json({
      listings: listingsResult.rows,
      offices: officesResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// توجيه أي مسار آخر ليفتح ملف index.html مباشرة
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
 });
