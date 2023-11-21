require ('dotenv').config();
const express = require('express');
const cors = require('cors');

const drugInteractionRoutes = require('./routes/drugInteractionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json());


app.use('/api/drug', drugInteractionRoutes);

    
app.listen(PORT, () => {
    console.log(`Server is running! at http://localhost:${PORT}`);
});