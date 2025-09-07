const express = require('express');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Init Middleware
app.use(express.json());

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./api/auth'));
app.use('/api/exercises', require('./api/exercises'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));