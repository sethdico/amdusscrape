const express = require('express');
const path = require('path');
const engine = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/scrape', async (req, res) => {
    const { prompt, cookies } = req.body;
    
    if (!prompt || !cookies) {
        return res.status(400).json({ error: "Required fields missing" });
    }

    try {
        const result = await engine.execute(prompt, cookies);
        res.json({ data: result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`AmduScrape active on port ${PORT}`);
});
