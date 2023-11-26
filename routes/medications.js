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
  const { medicationId, action } = req.params; // 'taken' or 'skipped'
  const { userId } = req.user;

  // Log incoming request details
  console.log(`Request to log medication action received:`);
  console.log(`Medication ID: ${medicationId}`);
  console.log(`Action: ${action}`);
  console.log(`User ID: ${userId}`);

  try {
    const insertResult = await db('user_drug_logs').insert({
      user_drug_id: medicationId,
      action,
      taken: action === 'taken'
    });

    // Log the result of the insert operation
    console.log(`Insert result: ${insertResult}`);

    res.status(200).json({ message: `Medication ${action} logged successfully.` });
  } catch (error) {
    console.error(`Error logging medication as ${action}:`, error);
    res.status(500).json({ message: `Error logging medication as ${action}.` });
  }
});

  
  module.exports = router;