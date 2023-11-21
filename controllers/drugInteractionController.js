const axios = require('axios');

const drugInteractionController = {
  async checkInteractions(req, res) {
    try {
      const drugIds = req.body.drugs;
      const apiUrl = `https://rxnav.nlm.nih.gov/REST/interaction/list.json?rxcuis=${drugIds.join('+')}`;

      const response = await axios.get(apiUrl);
      const interactions = response.data;

      res.json({ interactions });
    } catch (error) {
      console.error('Error fetching drug interactions:', error);
      res.status(500).send('Error fetching drug interactions');
    }
  }
};

module.exports = drugInteractionController;
