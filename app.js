const express = require('express');
const fs = require('fs');
const path = require('path');
const cache = require('memory-cache');
const winston = require('winston');

const nunjucks = require('nunjucks');

// Initialize the Express app first
const app = express();
const port = process.env.PORT || 3000;

// Set up Nunjucks templating engine
nunjucks.configure('templates', {
  autoescape: true,
  express: app
});

// --- Logger ---
const logger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/server.log' })
  ]
});

app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// --- Utility: Read file ---
const readDataFromFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.error(`File read error: ${error.message}`);
    return null;
  }
};

// --- Validation Middleware ---
const validateQueryParams = (req, res, next) => {
  const { location, queryType } = req.query;
  const validLocations = ['bangalore', 'delhi'];
  const validQueryTypes = ['menu', 'services', 'pricing', 'hours'];

  if (!location || !queryType) {
    return res.status(400).json({ error: 'Both location and queryType are required.' });
  }

  if (!validLocations.includes(location.toLowerCase())) {
    return res.status(400).json({ error: `Invalid location. Try: ${validLocations.join(', ')}` });
  }

  if (!validQueryTypes.includes(queryType.toLowerCase())) {
    return res.status(400).json({ error: `Invalid queryType. Try: ${validQueryTypes.join(', ')}` });
  }

  next();
};

// --- Endpoint: /classify-query ---
app.get('/classify-query', (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: 'Query is required.' });

  let location = 'general';
  let queryType = 'menu';

  if (query.toLowerCase().includes('bangalore')) location = 'bangalore';
  else if (query.toLowerCase().includes('delhi')) location = 'delhi';

  if (query.toLowerCase().includes('services')) queryType = 'services';
  else if (query.toLowerCase().includes('pricing')) queryType = 'pricing';
  else if (query.toLowerCase().includes('menu')) queryType = 'menu';

  res.json({ location, queryType });
});

app.get('/get-info', validateQueryParams, (req, res) => {
  const { location, queryType, page = 1 } = req.query;
  const cacheKey = `${location}-${queryType}-page-${page}`;

  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  const filePath = path.join(__dirname, 'data', location, `${queryType}.json`);
  const data = readDataFromFile(filePath);

  if (!data) {
    return res.status(404).json({
      message: `Sorry, no information found for "${location}" - "${queryType}".`,
      suggestion: 'Try a different query or location.'
    });
  }

  const charLimit = 4000;
  const jsonString = JSON.stringify(data);
  const totalPages = Math.ceil(jsonString.length / charLimit);
  const start = (page - 1) * charLimit;
  const end = start + charLimit;

  if (start >= jsonString.length) {
    return res.status(404).json({ message: 'No data available for this page.' });
  }

  let chunk;
  try {
    chunk = JSON.parse(jsonString.slice(start, end));
  } catch {
    chunk = jsonString.slice(start, end);
  }

  const result = {
    info: chunk,
    currentPage: Number(page),
    nextPage: page < totalPages ? Number(page) + 1 : null,
    totalPages
  };

  cache.put(cacheKey, result);
  res.json(result);
});

// --- Error Handler ---
app.use((err, req, res, next) => {
  logger.error(`Unexpected error: ${err.stack}`);
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  logger.info(`Server started on port ${port}`);
});
