const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const knex = require('../knexfile');

const JWT_SECRET = process.env.SESSION_SECRET;

// Register user
router.post('/register', async (req, res) => {
    const { email, password, ...otherData } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await knex('users').insert({ ...otherData, email, password: hashedPassword });
        res.status(201).json({ message: "User created successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error registering user." });
    }
});

// User login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await knex('users').where({ email }).first();
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
            res.json({ token });
        } else {
            res.status(401).json({ message: "Invalid credentials." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error logging in." });
    }
});

//  Current user
router.get('/current', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "No token provided." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.userId;
        knex('users').where({ id: userId }).first().then(user => {
            res.json(user);
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid token." });
    }
});

// Save a drug to user's profile (/api/users/drugs)
router.post('/drugs', authorize, async (req, res) => {
    const { userId } = req.user;
    const { drugName, strength, rxnormId } = req.body;
  
    try {
      await knex('user_drugs').insert({ user_id: userId, drug_name: drugName, strength: strength, rxnorm_id: rxnormId});
      res.status(201).json({ message: "Drug saved to profile." });
    } catch (error) {
      console.error('Error saving drug:', error);
      res.status(500).json({ message: "Error saving drug to profile." });
    }
  });

module.exports = router;
