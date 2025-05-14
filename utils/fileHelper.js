const fs = require('fs');
const path = require('path');

/**
 * Reads JSON data from a file.
 * @param {string} location - The location (bangalore, delhi, etc.)
 * @param {string} queryType - The type of data to fetch (menu, services, etc.)
 * @returns {Promise<Object>} Parsed JSON data.
 */
const readData = async (location, queryType) => {
  const filePath = path.join(__dirname, '..', 'data', location, `${queryType}.json`);
  
  try {
    const fileData = await fs.promises.readFile(filePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    throw new Error(`Error reading data from ${filePath}: ${error.message}`);
  }
};

module.exports = { readData };
