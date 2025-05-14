const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { chunkText } = require('../utils/tokenizer');
const { classifyQuery } = require('../utils/fileHelper');

const dataPath = path.join(__dirname, '../data/bangalore_electronic_city.json');
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const branch = rawData.branches[0]; // Assuming one branch per city for now

router.post('/query', (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing query' });

    const type = classifyQuery(query);

    if (type === 'unknown') {
      return res.status(404).json({
        message: `Sorry, I don't have information related to your question.`,
      });
    }

    const section = branch[type];

    if (!section) {
      return res.status(404).json({
        message: `Information for '${type}' is not available.`,
      });
    }

    const responseString = JSON.stringify(section);
    const chunks = chunkText(responseString);

    res.status(200).json({
      total_chunks: chunks.length,
      chunks: chunks,
    });

  } catch (err) {
    console.error('Error handling query:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
