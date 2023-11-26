require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const authorize = require('./middleware/authorize');

cron.schedule('* * * * *', async () => {
  console.log('Running a task every minute');

  const currentTime = moment().format('HH:mm');
  
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/api/reminders?time=${currentTime}`);
    const reminders = response.data;

    reminders.forEach(reminder => {
      console.log(`Reminder for ${reminder.drug_name}: Take your medication.`);   // TODO: Integrate with Twilio or Nodemailer (free alternative)
    });

  } catch (error) {
    console.error('Error sending out reminders:', error);
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
