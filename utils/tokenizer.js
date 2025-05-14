function countTokens(str) {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(str.length / 4);
}

function chunkText(text, maxTokens = 800) {
  const words = text.split(' ');
  const chunks = [];
  let currentChunk = '';

  for (let word of words) {
    if (countTokens(currentChunk + ' ' + word) > maxTokens) {
      chunks.push(currentChunk.trim());
      currentChunk = word;
    } else {
      currentChunk += ' ' + word;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

module.exports = { countTokens, chunkText };
