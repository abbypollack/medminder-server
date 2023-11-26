const express = require('express');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../knexfile');
const db = knex(knexConfig);
const authorize = require('../middleware/authorize');

const JWT_SECRET = process.env.SESSION_SECRET;


// Fetch medications for today
router.get('/today', authorize, async (req, res) => {
  const { userId } = req.user;
  try {
      const userDrugs = await db('user_drugs')
          .where({ user_id: userId })
          .select('id', 'drug_name', 'strength', 'reminder_times');

      res.json(userDrugs);
  } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: "Error fetching medications." });
  }
});
  
 // Log action taken for a medication
 router.post('/:medicationId/:action', authorize, async (req, res) => {
  const { medicationId, action } = req.params;
  const { userId } = req.user;

  try {
    const insertResult = await db('user_drug_logs').insert({
      user_drug_id: medicationId,
      action,
      taken: action === 'taken'
    });

    const drugDetails = await db('user_drugs')
      .join('user_drug_logs', 'user_drugs.id', 'user_drug_logs.user_drug_id')
      .where('user_drugs.id', medicationId)
      .first('user_drugs.drug_name', 'user_drugs.strength', 'user_drug_logs.action_time');

    res.status(200).json({
      message: `Medication ${action} logged successfully.`,
      drug_name: drugDetails.drug_name,
      strength: drugDetails.strength,
      action_time: drugDetails.action_time
    });
  } catch (error) {
    console.error(`Error logging medication as ${action}:`, error);
    res.status(500).json({ message: `Error logging medication as ${action}.` });
  }
});

// Fetch logged medications for the current day
router.get('/logged', authorize, async (req, res) => {
  const { userId } = req.user;
  const today = new Date().toISOString().slice(0, 10);

  try {
    const loggedMedications = await knex('user_drug_logs')
      .join('user_drugs', 'user_drugs.id', 'user_drug_logs.user_drug_id')
      .where('user_drugs.user_id', userId)
      .andWhereRaw('DATE(user_drug_logs.created_at) = ?', [today])
      .select('user_drugs.drug_name', 'user_drugs.strength', 'user_drug_logs.action', 'user_drug_logs.created_at');

    res.json({ loggedMedications });
  } catch (error) {
    console.error('Error fetching logged medications:', error);
    res.status(500).json({ message: "Error fetching logged medications." });
  }
});

  
  module.exports = router;