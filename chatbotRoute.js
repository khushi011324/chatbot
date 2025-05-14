const express = require('express');
const { classifyQuery } = require('./utils/fileHelper');
const router = express.Router();

router.post('/chatbot', (req, res) => {
  const userQuery = req.body.query;

  // Classify the query
  const category = classifyQuery(userQuery);

  // Respond based on the query category
  switch (category) {
    case 'branch_timings':
      return res.json({ response: 'Our branch timings are from 9 AM to 9 PM.' });
    case 'menu':
      return res.json({ response: 'Here is the menu: [List of items]' });
    case 'pricing':
      return res.json({ response: 'Prices vary. Please check our pricing page for details.' });
    case 'offers':
      return res.json({ response: 'Current offers: 20% off on all orders above $50!' });
    case 'faq':
      return res.json({ response: 'FAQs: How to cancel orders, etc.' });
    case 'branch_info':
      return res.json({ response: 'Our branch is located at XYZ street.' });
    default:
      return res.json({ response: 'Sorry, I didn\'t understand your query. Can you try again?' });
  }
});

module.exports = router;
