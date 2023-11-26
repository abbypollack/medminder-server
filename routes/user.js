const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const knex = require('knex');
const knexConfig = require('../knexfile');
const db = knex(knexConfig);


const JWT_SECRET = process.env.SESSION_SECRET;

// Authorize middleware
const authorize = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { userId: decoded.userId };
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Register user
router.post('/register', async (req, res) => {
    const { email, password, ...otherData } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userId] = await db('users')
            .insert({ ...otherData, email, password: hashedPassword })
            .returning('id');
        const user = await db('users').where({ id: userId }).first();
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Error in /register route:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ message: "Email already exists." });
        } else {
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db('users').where({ email }).first();
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
            console.log('Sending user and token:', user, token);
            res.json({ token });
        } else {
            res.status(401).json({ message: "Invalid credentials." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in." });
    }
});

//  Current user
router.get('/current', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        const user = await db('users').where({ id: userId }).first();
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        console.log('Current user:', user)
        res.json({ user });
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            res.status(401).json({ message: "Invalid token." });
        } else {
            res.status(500).json({ message: "Internal server error." });
        }
    }
});

// Fetch user's medications
router.get('/drugs', authorize, async (req, res) => {
    const { userId } = req.user;

    try {
        const userDrugs = await db('user_drugs')
            .where({ user_id: userId })
            .select('id', 'drug_name', 'strength', 'rxnorm_id', 'reminder_frequency', 'reminder_times');

        res.json({ medications: userDrugs });
    } catch (error) {
        console.error('Error fetching user medications:', error);
        res.status(500).json({ message: "Error fetching medications." });
    }
});



// Save a drug to user's profile
router.post('/drugs', authorize, async (req, res) => {
    const { userId } = req.user;
    const { drugName, strength, rxnormId, reminderFrequency, reminderTimes } = req.body;

    if (!drugName) {
        return res.status(400).json({ message: "Drug name is required." });
    }

    try {
        await db('user_drugs').insert({
            user_id: userId,
            drug_name: drugName,
            strength,
            rxnorm_id: rxnormId,
            reminder_frequency: reminderFrequency,
            reminder_times: JSON.stringify(reminderTimes)
        });
        res.status(201).json({ message: "Drug saved to profile." });
    } catch (error) {
        console.error('Error saving drug:', error);
        res.status(500).json({ message: "Error saving drug to profile." });
    }
});

// Update a drug in user's profile
router.patch('/drugs/:id', authorize, async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;
    const { drugName, strength, rxnormId, reminderFrequency, reminderTimes } = req.body;

    try {
        await db('user_drugs')
            .where({ user_id: userId, id: id })
            .update({
                drug_name: drugName,
                strength,
                rxnorm_id: rxnormId,
                reminder_frequency: reminderFrequency,
                reminder_times: JSON.stringify(reminderTimes)
            });
        res.status(200).json({ message: "Drug updated successfully." });
    } catch (error) {
        console.error('Error updating drug:', error);
        res.status(500).json({ message: "Error updating drug in profile." });
    }
});

// Delete a drug from user's profile
router.delete('/drugs/:id', authorize, async (req, res) => {
    const { userId } = req.user;
    const { id } = req.params;

    try {
        const deletedRows = await db('user_drugs')
            .where({ user_id: userId, id: id })
            .del();

        if (deletedRows > 0) {
            res.status(200).json({ message: "Drug deleted successfully." });
        } else {
            res.status(404).json({ message: "Drug not found or does not belong to the user." });
        }
    } catch (error) {
        console.error('Error deleting drug:', error);
        res.status(500).json({ message: "Error deleting drug from profile." });
    }
});

// Handle updates to the user's profile
router.patch('/updateProfile', authorize, async (req, res) => {
    const { userId } = req.user;
    const { firstName, lastName, phone } = req.body;

    try {
        await db('users').where({ id: userId }).update({ firstName, lastName, phone });
        const updatedUser = await db('users').where({ id: userId }).first();
        res.status(200).json({ message: "Profile updated successfully.", updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: "Error updating profile.", error: error.message });
    }
});

module.exports = router;
