const express = require('express');
const { Client } = require('pg');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// جعل السيرفر يعرض ملفات الواجهة (HTML, CSS, JS) تلقائياً
app.use(express.static(path.join(__dirname, '../')));

// مسار جلب البيانات المباشر من Neon
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});