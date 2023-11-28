require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');
const authorize = require('./middleware/authorize');
const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


cron.schedule('* * * * *', async () => {
  console.log('Running a task every minute');

  const currentTime = moment().format('HH:mm');
  
  try {
    const response = await axios.get(`${process.env.SERVER_URL}/api/reminders?time=${currentTime}`);
    const reminders = response.data;

    reminders.forEach(reminder => {
      client.messages.create({
        body: `Reminder for ${reminder.drug_name}: Take your medication.`,
        to: phone,
        from: process.env.TWILIO_PHONE_NUMBER
      })
      .then(message => console.log(message.sid))
      .catch(error => console.error(error));
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
      .join('users', 'users.id', 'user_drugs.user_id')
      .where({ user_id: userId })
      .andWhereRaw('JSON_CONTAINS(reminder_times, ?)', [`"${time}"`])
      .select('user_drugs.id', 'user_drugs.drug_name', 'user_drugs.strength', 'user_drugs.reminder_times', 'users.phone');

    const remindersWithPhone = userDrugs.filter(drug => drug.reminder_times.includes(time))
      .map(drug => ({
        drug_name: drug.drug_name,
        phone: drug.phone
      }));

    res.json({ reminders: remindersWithPhone });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: "Error fetching reminders." });
  }
});

