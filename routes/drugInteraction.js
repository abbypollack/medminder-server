const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/interactions', async (req, res) => {
  const { drugs } = req.body;
  const drugIds = drugs.join('+');
  const apiUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${drugIds}`;
  if (!drugs || !Array.isArray(drugs) || drugs.some(drugId => !drugId)) {
    return res.status(400).json({ message: "Invalid drug IDs" });
  }

  try {
    const response = await axios.get(apiUrl);
    const interactions = response.data;
    res.json(interactions);
  } catch (error) {
    console.error('Error fetching drug interactions:', error);
    res.status(error.response?.status || 500).send(error.response?.data || 'Error fetching drug interactions');
  }
});

module.exports = router;