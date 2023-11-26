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
    const today = new Date().toISOString().slice(0, 10);
  
    try {
      const todaysMedications = await knex('user_drugs')
        .where({ user_id: userId })
        .andWhere('date_for_use', today)
        .select('id', 'drug_name', 'strength', 'reminder_times');
  
      res.json(todaysMedications);
    } catch (error) {
      console.error('Error fetching today\'s medications:', error);
      res.status(500).json({ message: "Error fetching today's medications." });
    }
  });
  
  // Log action taken for a medication
  router.post('/:medicationId/:action', authorize, async (req, res) => {
    const { medicationId, action } = req.params; // 'taken' or 'skipped'
    const { userId } = req.user;
  
    try {
      await knex('user_drug_logs').insert({
        user_drug_id: medicationId,
        action,
        taken: action === 'taken'
      });
  
      res.status(200).json({ message: `Medication ${action} logged successfully.` });
    } catch (error) {
      console.error(`Error logging medication as ${action}:`, error);
      res.status(500).json({ message: `Error logging medication as ${action}.` });
    }
  });

// Fetches and filters user drugs that have a specific reminder time 
  router.get('/reminders', authorize, async (req, res) => {
    const { time } = req.query;
    const { userId } = req.user;
  
    try {
      const userDrugs = await db('user_drugs')
        .where({ user_id: userId })
        .andWhereRaw('JSON_CONTAINS(reminder_times, ?)', [`"${time}"`])
        .select('id', 'drug_name', 'strength', 'reminder_times');
  
      res.json({ reminders: userDrugs.filter(drug => drug.reminder_times.includes(time)) });
    } catch (error) {
      console.error('Error fetching reminders:', error);
      res.status(500).json({ message: "Error fetching reminders." });
    }
  });
  
  
  module.exports = router;