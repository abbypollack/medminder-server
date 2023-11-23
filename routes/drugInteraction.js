const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/interactions', async (req, res) => {
  const { drugs } = req.body;
  const drugIds = drugs.join('+');
  const apiUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${drugIds}`;

  try {
    const response = await axios.get(apiUrl);
    const interactions = response.data;
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching drug interactions:', error);
    res.status(500).send('Error fetching drug interactions');
  }
});

module.exports = router;
