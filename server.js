require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
// Serve index.html from root directory
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
// Allow specific origin
app.use(cors({
}));
app.use(bodyParser.json()); // Body parser middleware
// Serve index.html from root directory

app.get('/health', async (req, res) => {
    try {
        res.status(200).json({ message: 'Database connection is healthy!' });
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).json({ message: 'Database connection error' });
    }
});
app.get('/chacco', (req, res) => {
    res.json({ message: 'CORS is working!' });
});
// Database connection
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:process.env.DB_PORT,
    connectTimeout: 10000, // Increase the timeout if necessary
});


// Validate user input
const isValidString = (str) => typeof str === 'string' && str.trim().length > 0;
const isValidNumber = (num) => typeof num === 'number' && num > 0;
const isValidDate = (date) => !isNaN(Date.parse(date));

app.post('/expenses', async (req, res) => {
    const { name, amount, date, notes } = req.body;

    console.log('Validating expense data:', { name, amount, date, notes });

    // Validate input
    if (!isValidString(name)) {
        console.log('Invalid name');
    }
    if (!isValidNumber(amount)) {
        console.log('Invalid amount');
    }
    if (!isValidDate(date)) {
        console.log('Invalid date');
    }
    if (!isValidString(notes)) {
        console.log('Invalid notes');
    }

    if (!isValidString(name) || !isValidNumber(amount) || !isValidDate(date) || !isValidString(notes)) {
        return res.status(400).json({ message: 'Invalid expense data' });
    }

    try {
        // Insert into the database
        await db.query('INSERT INTO expenses (expense_name, amount, expense_date, notes) VALUES (?, ?, ?, ?)', [name, amount, date, notes]);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error recording expense' });
    }
});

// Fetch the total of all expenses
app.get('/expenses/total', async (req, res) => {
    try {
        const [result] = await db.query('SELECT SUM(amount) AS total FROM expenses');
        res.json(result[0] || { total: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching total expenses' });
    }
});
// Fetch all expenses
app.get('/expenses', async (req, res) => {
    try {
        const [expenses] = await db.query('SELECT * FROM expenses');
        res.json(expenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching expenses' });
    }
});
app.get('/chacco/expenses/total', async (req, res) => {
    try {
        // Query to calculate the sum of the amounts in the expenses table
        const [result] = await db.query('SELECT SUM(amount) AS total FROM expenses');

        // Return the total expenses
        res.json(result[0] || { total: 0 });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching total expenses' });
    }
});
//income data
app.get('/chacco/incomes/data', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT month,
                   SUM(installmentsAmount) AS installmentsAmount,
                   SUM(amountPaid) AS amountPaid
            FROM (
                     -- Get installments per month
                     SELECT DATE_FORMAT(installment_date, '%Y-%m') AS month,
                            SUM(amount) AS installmentsAmount,
                            0 AS amountPaid
                     FROM installments
                     GROUP BY DATE_FORMAT(installment_date, '%Y-%m')

                     UNION ALL

                     -- Get amount_paid per month
                     SELECT DATE_FORMAT(date_joined, '%Y-%m') AS month,
                            0 AS installmentsAmount,
                            SUM(amount_paid) AS amountPaid
                     FROM clients
                     GROUP BY DATE_FORMAT(date_joined, '%Y-%m')
                 ) AS combined
            GROUP BY month
            ORDER BY month;

        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching income data:', error);
        res.status(500).json({ error: 'Failed to fetch income data' });
    }
})


app.get('/chacco/balance_breakdown/all', async (req, res) => {
    try {
        const [expensesData] = await db.query(`
            SELECT
                expense_name,
                amount,
                expense_date,
                notes
            FROM
                expenses
        `);
        const [incomesData] = await db.query(`
            SELECT
                name,
                amount,
                date,
                notes
            FROM
                incomes
        `);

        // 👇 Aggregate data into a single object
        const responseData = {
            clients: clientsData,
            installments: installmentsData,
            incomes: incomesData,
            expenses: expensesData

        };

        // 👇 Log the full response JSON
        console.log('Sending response:', JSON.stringify(responseData, null, 2));
        console.log(incomesData);
        console.log(expensesData);
        // ✅ Send the response
        res.json(responseData);

    } catch (error) {
        console.error('Error fetching balance breakdown:', error);
        res.status(500).json({ error: 'Failed to fetch balance breakdown data' });
    }
});


// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
