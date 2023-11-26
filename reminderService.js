const cron = require('node-cron');
const axios = require('axios');
const moment = require('moment');

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
