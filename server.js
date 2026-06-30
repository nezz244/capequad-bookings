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
        await db.query('SELECT 1');
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

const defaultCommissions = [
    ['GetYourGuide', 34],
    ['Fomo', 25],
    ['Hyperli', 20],
    ['Viator', 22],
    ['Wikideals', 25],
    ['Ontours', 0],
    ['Walk-in', 0],
    ['Direct', 0],
    ['Other', 0],
];

async function ensureColumn(table, column, definition) {
    const [columns] = await db.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);

    if (columns.length === 0) {
        await db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
}

async function ensureTables() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(120) NOT NULL,
            pax INT NOT NULL,
            phone VARCHAR(40),
            platform VARCHAR(80) NOT NULL,
            account_name VARCHAR(120),
            product_name VARCHAR(160),
            booking_date DATE NOT NULL,
            start_time TIME NOT NULL,
            duration_minutes INT NOT NULL DEFAULT 60,
            location VARCHAR(180),
            payment_status VARCHAR(80),
            amount DECIMAL(10, 2),
            notes TEXT,
            created_by VARCHAR(160),
            calendar_event_id VARCHAR(255),
            calendar_status VARCHAR(40) NOT NULL DEFAULT 'visible',
            calendar_error TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_booking_date_start_time (booking_date, start_time),
            INDEX idx_platform (platform)
        )
    `);
    await db.query(`
        ALTER TABLE bookings
        MODIFY calendar_status VARCHAR(40) NOT NULL DEFAULT 'visible'
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS platform_commissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platform_name VARCHAR(80) NOT NULL UNIQUE,
            commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 0,
            updated_by VARCHAR(160),
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS platform_accounts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            platform_name VARCHAR(80) NOT NULL,
            account_name VARCHAR(120) NOT NULL,
            commission_rate DECIMAL(5, 2),
            is_active TINYINT(1) NOT NULL DEFAULT 1,
            updated_by VARCHAR(160),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_platform_account (platform_name, account_name),
            INDEX idx_platform_account_platform (platform_name)
        )
    `);
    await ensureColumn('incomes', 'created_by', 'VARCHAR(160)');
    await ensureColumn('expenses', 'created_by', 'VARCHAR(160)');

    for (const [platform, rate] of defaultCommissions) {
        await db.query(`
            INSERT INTO platform_commissions (platform_name, commission_rate)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE platform_name = platform_name
        `, [platform, rate]);
    }

    await db.query(`
        INSERT INTO platform_accounts (platform_name, account_name)
        SELECT DISTINCT platform, account_name
        FROM bookings
        WHERE account_name IS NOT NULL AND account_name <> ''
        ON DUPLICATE KEY UPDATE account_name = VALUES(account_name)
    `);
}

ensureTables().catch((error) => {
    console.error('Failed to initialise database tables:', error);
});


// Validate user input
const isValidString = (str) => typeof str === 'string' && str.trim().length > 0;
const isValidNumber = (num) => typeof num === 'number' && num > 0;
const isValidDate = (date) => !isNaN(Date.parse(date));
const normaliseBlank = (value) => {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
};
const getCreatedBy = (body) => normaliseBlank(body.created_by) || normaliseBlank(body.admin_name) || 'Unknown admin';

function buildBookingFromBody(body) {
    return {
        customer_name: normaliseBlank(body.customer_name),
        pax: Number(body.pax),
        phone: normaliseBlank(body.phone),
        platform: normaliseBlank(body.platform),
        account_name: normaliseBlank(body.account_name),
        product_name: normaliseBlank(body.product_name),
        booking_date: body.booking_date,
        start_time: body.start_time,
        duration_minutes: Number(body.duration_minutes) || 60,
        location: normaliseBlank(body.location),
        payment_status: normaliseBlank(body.payment_status),
        amount: body.amount === '' || body.amount == null ? null : Number(body.amount),
        notes: normaliseBlank(body.notes),
        created_by: getCreatedBy(body),
    };
}

function validateBookingPayload(booking) {
    if (!isValidString(booking.customer_name)) {
        return 'Customer name is required.';
    }

    if (!Number.isInteger(booking.pax) || booking.pax < 1) {
        return 'Pax must be a positive whole number.';
    }

    if (!isValidString(booking.platform)) {
        return 'Platform is required.';
    }

    if (!isValidDate(booking.booking_date)) {
        return 'Booking date is required.';
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(booking.start_time)) {
        return 'Start time must use HH:MM format.';
    }

    if (!Number.isInteger(booking.duration_minutes) || booking.duration_minutes < 15) {
        return 'Duration must be at least 15 minutes.';
    }

    if (booking.amount !== null && (Number.isNaN(booking.amount) || booking.amount < 0)) {
        return 'Amount must be zero or more.';
    }

    return null;
}

async function upsertPlatformAccountForBooking(booking) {
    if (!booking.account_name) return;

    await db.query(`
        INSERT INTO platform_accounts (platform_name, account_name, updated_by)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE account_name = VALUES(account_name)
    `, [booking.platform, booking.account_name, booking.created_by]);
}

function bookingIncomeSelect(whereClause = '') {
    return `
        SELECT
            b.id,
            b.customer_name,
            b.pax,
            b.platform,
            b.account_name,
            b.product_name,
            b.booking_date,
            b.start_time,
            COALESCE(b.amount, 0) AS gross_amount,
            COALESCE(pa.commission_rate, pc.commission_rate, 0) AS commission_rate,
            CASE WHEN pa.commission_rate IS NULL THEN 'platform' ELSE 'account' END AS commission_source,
            ROUND(COALESCE(b.amount, 0) * COALESCE(pa.commission_rate, pc.commission_rate, 0) / 100, 2) AS commission_amount,
            ROUND(COALESCE(b.amount, 0) - (COALESCE(b.amount, 0) * COALESCE(pa.commission_rate, pc.commission_rate, 0) / 100), 2) AS net_amount,
            b.created_by
        FROM bookings b
        LEFT JOIN platform_commissions pc ON LOWER(pc.platform_name) = LOWER(b.platform)
        LEFT JOIN platform_accounts pa ON LOWER(pa.platform_name) = LOWER(b.platform) AND LOWER(pa.account_name) = LOWER(b.account_name)
        ${whereClause}
    `;
}

app.post('/expenses', async (req, res) => {
    const { name, amount, date, notes } = req.body;
    const createdBy = getCreatedBy(req.body);

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
        await db.query('INSERT INTO expenses (expense_name, amount, expense_date, notes, created_by) VALUES (?, ?, ?, ?, ?)', [name, amount, date, notes, createdBy]);
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
            SELECT
                DATE_FORMAT(transaction_date, '%Y-%m') AS month,
                SUM(amount) AS totalIncome
            FROM (
                SELECT date AS transaction_date, amount FROM incomes
                UNION ALL
                SELECT booking_date AS transaction_date, net_amount AS amount FROM (${bookingIncomeSelect()}) booking_income
            ) monthly_income
            GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
            ORDER BY month;
        `);

        res.json(rows);

    } catch (error) {
        console.error('Error fetching income data:', error);
        res.status(500).json({ error: 'Failed to fetch income data' });
    }
});
app.post('/incomes', async (req, res) => {
    try {
        const { name, amount, date, notes } = req.body;
        const createdBy = getCreatedBy(req.body);

        // Input validation
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required and must be a valid string.' });
        }

        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).json({ error: 'Amount is required and must be a positive number.' });
        }

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ error: 'Date is required and must be a valid date.' });
        }

        if (notes && typeof notes !== 'string') {
            return res.status(400).json({ error: 'Notes must be a valid string.' });
        }

        // Insert into the database using await
        const query = 'INSERT INTO incomes (name, amount, date, notes, created_by) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [name, amount, date, notes, createdBy]);

        // Success response
        res.json({ success: true });

    } catch (error) {
        console.error('Error inserting income:', error);
        res.status(500).json({ error: 'Database insertion failed' });
    }
});
app.get('/chacco/incomes/total', async (req, res) => {
    try {
        const [manualRows] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) AS manualIncome FROM incomes
        `);
        const [bookingRows] = await db.query(`
            SELECT
                COALESCE(SUM(gross_amount), 0) AS bookingGrossIncome,
                COALESCE(SUM(commission_amount), 0) AS bookingCommission,
                COALESCE(SUM(net_amount), 0) AS bookingNetIncome
            FROM (${bookingIncomeSelect()}) booking_income
        `);

        const manualIncome = Number(manualRows[0].manualIncome) || 0;
        const bookingNetIncome = Number(bookingRows[0].bookingNetIncome) || 0;

        res.json({
            totalIncome: manualIncome + bookingNetIncome,
            manualIncome,
            bookingGrossIncome: Number(bookingRows[0].bookingGrossIncome) || 0,
            bookingCommission: Number(bookingRows[0].bookingCommission) || 0,
            bookingNetIncome,
        });
    } catch (error) {
        console.error('Error fetching total income:', error);
        res.status(500).json({ error: 'Failed to fetch total income' });
    }
});

app.get('/platform-commissions', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT platform_name, commission_rate, updated_by, updated_at
            FROM platform_commissions
            ORDER BY FIELD(platform_name, 'GetYourGuide', 'Fomo', 'Hyperli', 'Viator', 'Wikideals', 'Ontours', 'Walk-in', 'Direct', 'Other'), platform_name
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching platform commissions:', error);
        res.status(500).json({ error: 'Failed to fetch platform commissions' });
    }
});

app.put('/platform-commissions', async (req, res) => {
    const commissions = Array.isArray(req.body.commissions) ? req.body.commissions : [];
    const updatedBy = getCreatedBy(req.body);

    if (commissions.length === 0) {
        return res.status(400).json({ error: 'At least one commission setting is required.' });
    }

    try {
        for (const commission of commissions) {
            const platformName = normaliseBlank(commission.platform_name);
            const commissionRate = Number(commission.commission_rate);

            if (!isValidString(platformName) || Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
                return res.status(400).json({ error: 'Commission rates must be between 0 and 100.' });
            }

            await db.query(`
                INSERT INTO platform_commissions (platform_name, commission_rate, updated_by)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE commission_rate = VALUES(commission_rate), updated_by = VALUES(updated_by)
            `, [platformName, commissionRate, updatedBy]);
        }

        const [rows] = await db.query(`
            SELECT platform_name, commission_rate, updated_by, updated_at
            FROM platform_commissions
            ORDER BY FIELD(platform_name, 'GetYourGuide', 'Fomo', 'Hyperli', 'Viator', 'Wikideals', 'Ontours', 'Walk-in', 'Direct', 'Other'), platform_name
        `);

        res.json({ success: true, commissions: rows });
    } catch (error) {
        console.error('Error updating platform commissions:', error);
        res.status(500).json({ error: 'Failed to update platform commissions' });
    }
});

app.get('/platform-accounts', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT id, platform_name, account_name, commission_rate, is_active, updated_by, created_at, updated_at
            FROM platform_accounts
            ORDER BY FIELD(platform_name, 'GetYourGuide', 'Fomo', 'Hyperli', 'Viator', 'Wikideals', 'Ontours', 'Walk-in', 'Direct', 'Other'), platform_name, account_name
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching platform accounts:', error);
        res.status(500).json({ error: 'Failed to fetch platform accounts' });
    }
});

app.put('/platform-accounts', async (req, res) => {
    const accounts = Array.isArray(req.body.accounts) ? req.body.accounts : [];
    const updatedBy = getCreatedBy(req.body);

    if (accounts.length === 0) {
        return res.status(400).json({ error: 'At least one platform account is required.' });
    }

    try {
        for (const account of accounts) {
            const platformName = normaliseBlank(account.platform_name);
            const accountName = normaliseBlank(account.account_name);
            const commissionRate = account.commission_rate === '' || account.commission_rate == null ? null : Number(account.commission_rate);
            const isActive = account.is_active === false || account.is_active === 0 || account.is_active === '0' ? 0 : 1;

            if (!isValidString(platformName) || !isValidString(accountName)) {
                return res.status(400).json({ error: 'Platform and account name are required.' });
            }

            if (commissionRate !== null && (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100)) {
                return res.status(400).json({ error: 'Account commission rates must be between 0 and 100.' });
            }

            await db.query(`
                INSERT INTO platform_accounts (platform_name, account_name, commission_rate, is_active, updated_by)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    commission_rate = VALUES(commission_rate),
                    is_active = VALUES(is_active),
                    updated_by = VALUES(updated_by)
            `, [platformName, accountName, commissionRate, isActive, updatedBy]);
        }

        const [rows] = await db.query(`
            SELECT id, platform_name, account_name, commission_rate, is_active, updated_by, created_at, updated_at
            FROM platform_accounts
            ORDER BY FIELD(platform_name, 'GetYourGuide', 'Fomo', 'Hyperli', 'Viator', 'Wikideals', 'Ontours', 'Walk-in', 'Direct', 'Other'), platform_name, account_name
        `);

        res.json({ success: true, accounts: rows });
    } catch (error) {
        console.error('Error updating platform accounts:', error);
        res.status(500).json({ error: 'Failed to update platform accounts' });
    }
});

app.get('/finance/summary', async (req, res) => {
    try {
        const [incomeRows] = await db.query(`
            SELECT
                COALESCE((SELECT SUM(amount) FROM incomes), 0) AS manualIncome,
                COALESCE(SUM(gross_amount), 0) AS bookingGrossIncome,
                COALESCE(SUM(commission_amount), 0) AS bookingCommission,
                COALESCE(SUM(net_amount), 0) AS bookingNetIncome
            FROM (${bookingIncomeSelect()}) booking_income
        `);
        const [expenseRows] = await db.query('SELECT COALESCE(SUM(amount), 0) AS totalExpenses FROM expenses');
        const summary = incomeRows[0];
        const manualIncome = Number(summary.manualIncome) || 0;
        const bookingNetIncome = Number(summary.bookingNetIncome) || 0;
        const totalExpenses = Number(expenseRows[0].totalExpenses) || 0;

        res.json({
            manualIncome,
            bookingGrossIncome: Number(summary.bookingGrossIncome) || 0,
            bookingCommission: Number(summary.bookingCommission) || 0,
            bookingNetIncome,
            totalIncome: manualIncome + bookingNetIncome,
            totalExpenses,
            balance: manualIncome + bookingNetIncome - totalExpenses,
        });
    } catch (error) {
        console.error('Error fetching finance summary:', error);
        res.status(500).json({ error: 'Failed to fetch finance summary' });
    }
});

app.get('/finance/consolidation', async (req, res) => {
    const { from, to } = req.query;

    if (!from || !to || !isValidDate(from) || !isValidDate(to)) {
        return res.status(400).json({ error: 'Valid from and to dates are required.' });
    }

    if (new Date(from) > new Date(to)) {
        return res.status(400).json({ error: 'From date must be before the to date.' });
    }

    try {
        const [bookingRows] = await db.query(`
            SELECT
                DATE_FORMAT(booking_date, '%Y-%m') AS month,
                COUNT(*) AS booking_count,
                COALESCE(SUM(pax), 0) AS pax,
                COALESCE(SUM(gross_amount), 0) AS booking_gross_income,
                COALESCE(SUM(commission_amount), 0) AS booking_commission,
                COALESCE(SUM(net_amount), 0) AS booking_net_income
            FROM (${bookingIncomeSelect('WHERE b.booking_date BETWEEN ? AND ?')}) booking_income
            GROUP BY DATE_FORMAT(booking_date, '%Y-%m')
        `, [from, to]);

        const [incomeRows] = await db.query(`
            SELECT
                DATE_FORMAT(date, '%Y-%m') AS month,
                COALESCE(SUM(amount), 0) AS manual_income
            FROM incomes
            WHERE date BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(date, '%Y-%m')
        `, [from, to]);

        const [expenseRows] = await db.query(`
            SELECT
                DATE_FORMAT(expense_date, '%Y-%m') AS month,
                COALESCE(SUM(amount), 0) AS expenses
            FROM expenses
            WHERE expense_date BETWEEN ? AND ?
            GROUP BY DATE_FORMAT(expense_date, '%Y-%m')
        `, [from, to]);

        const months = new Map();
        const makeMonth = (month) => ({
            month,
            booking_count: 0,
            pax: 0,
            booking_gross_income: 0,
            booking_commission: 0,
            booking_net_income: 0,
            manual_income: 0,
            total_income: 0,
            expenses: 0,
            balance: 0,
        });
        const ensureMonth = (month) => {
            if (!months.has(month)) {
                months.set(month, makeMonth(month));
            }

            return months.get(month);
        };

        bookingRows.forEach((row) => {
            const month = ensureMonth(row.month);
            month.booking_count = Number(row.booking_count) || 0;
            month.pax = Number(row.pax) || 0;
            month.booking_gross_income = Number(row.booking_gross_income) || 0;
            month.booking_commission = Number(row.booking_commission) || 0;
            month.booking_net_income = Number(row.booking_net_income) || 0;
        });

        incomeRows.forEach((row) => {
            ensureMonth(row.month).manual_income = Number(row.manual_income) || 0;
        });

        expenseRows.forEach((row) => {
            ensureMonth(row.month).expenses = Number(row.expenses) || 0;
        });

        const rows = Array.from(months.values())
            .sort((a, b) => a.month.localeCompare(b.month))
            .map((month) => {
                month.total_income = month.booking_net_income + month.manual_income;
                month.balance = month.total_income - month.expenses;
                return month;
            });

        const totals = rows.reduce((summary, row) => ({
            booking_count: summary.booking_count + row.booking_count,
            pax: summary.pax + row.pax,
            booking_gross_income: summary.booking_gross_income + row.booking_gross_income,
            booking_commission: summary.booking_commission + row.booking_commission,
            booking_net_income: summary.booking_net_income + row.booking_net_income,
            manual_income: summary.manual_income + row.manual_income,
            total_income: summary.total_income + row.total_income,
            expenses: summary.expenses + row.expenses,
            balance: summary.balance + row.balance,
        }), {
            booking_count: 0,
            pax: 0,
            booking_gross_income: 0,
            booking_commission: 0,
            booking_net_income: 0,
            manual_income: 0,
            total_income: 0,
            expenses: 0,
            balance: 0,
        });

        res.json({ from, to, rows, totals });
    } catch (error) {
        console.error('Error fetching finance consolidation:', error);
        res.status(500).json({ error: 'Failed to fetch finance consolidation' });
    }
});

app.get('/bookings', async (req, res) => {
    const { from, to } = req.query;
    const params = [];
    const where = [];

    if (from) {
        where.push('booking_date >= ?');
        params.push(from);
    }

    if (to) {
        where.push('booking_date <= ?');
        params.push(to);
    }

    try {
        const [rows] = await db.query(`
            SELECT
                id,
                customer_name,
                pax,
                phone,
                platform,
                account_name,
                product_name,
                DATE_FORMAT(booking_date, '%Y-%m-%d') AS booking_date,
                TIME_FORMAT(start_time, '%H:%i') AS start_time,
                duration_minutes,
                location,
                payment_status,
                amount,
                notes,
                created_by,
                calendar_event_id,
                calendar_status,
                calendar_error,
                gross_amount,
                commission_rate,
                commission_source,
                commission_amount,
                net_amount,
                created_at,
                updated_at
            FROM (
                SELECT
                    b.*,
                    COALESCE(b.amount, 0) AS gross_amount,
                    COALESCE(pa.commission_rate, pc.commission_rate, 0) AS commission_rate,
                    CASE WHEN pa.commission_rate IS NULL THEN 'platform' ELSE 'account' END AS commission_source,
                    ROUND(COALESCE(b.amount, 0) * COALESCE(pa.commission_rate, pc.commission_rate, 0) / 100, 2) AS commission_amount,
                    ROUND(COALESCE(b.amount, 0) - (COALESCE(b.amount, 0) * COALESCE(pa.commission_rate, pc.commission_rate, 0) / 100), 2) AS net_amount
                FROM bookings b
                LEFT JOIN platform_commissions pc ON LOWER(pc.platform_name) = LOWER(b.platform)
                LEFT JOIN platform_accounts pa ON LOWER(pa.platform_name) = LOWER(b.platform) AND LOWER(pa.account_name) = LOWER(b.account_name)
            ) bookings_with_income
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY booking_date DESC, start_time DESC
        `, params);

        res.json(rows);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

app.post('/bookings', async (req, res) => {
    const booking = buildBookingFromBody(req.body);
    const validationError = validateBookingPayload(booking);

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const [result] = await db.query(`
            INSERT INTO bookings (
                customer_name,
                pax,
                phone,
                platform,
                account_name,
                product_name,
                booking_date,
                start_time,
                duration_minutes,
                location,
                payment_status,
                amount,
                notes,
                created_by,
                calendar_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'visible')
        `, [
            booking.customer_name,
            booking.pax,
            booking.phone,
            booking.platform,
            booking.account_name,
            booking.product_name,
            booking.booking_date,
            booking.start_time,
            booking.duration_minutes,
            booking.location,
            booking.payment_status,
            booking.amount,
            booking.notes,
            booking.created_by,
        ]);

        await upsertPlatformAccountForBooking(booking);

        res.status(201).json({
            success: true,
            booking: {
                id: result.insertId,
                ...booking,
                calendar_status: 'visible',
            },
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

app.put('/bookings/:id', async (req, res) => {
    const bookingId = Number(req.params.id);
    const booking = buildBookingFromBody(req.body);
    const validationError = validateBookingPayload(booking);

    if (!Number.isInteger(bookingId) || bookingId < 1) {
        return res.status(400).json({ error: 'A valid booking id is required.' });
    }

    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const [result] = await db.query(`
            UPDATE bookings
            SET
                customer_name = ?,
                pax = ?,
                phone = ?,
                platform = ?,
                account_name = ?,
                product_name = ?,
                booking_date = ?,
                start_time = ?,
                duration_minutes = ?,
                location = ?,
                payment_status = ?,
                amount = ?,
                notes = ?,
                created_by = ?
            WHERE id = ?
        `, [
            booking.customer_name,
            booking.pax,
            booking.phone,
            booking.platform,
            booking.account_name,
            booking.product_name,
            booking.booking_date,
            booking.start_time,
            booking.duration_minutes,
            booking.location,
            booking.payment_status,
            booking.amount,
            booking.notes,
            booking.created_by,
            bookingId,
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found.' });
        }

        await upsertPlatformAccountForBooking(booking);

        res.json({
            success: true,
            booking: {
                id: bookingId,
                ...booking,
            },
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

app.get('/chacco/balance_breakdown/all', async (req, res) => {
    try {
        const [expensesData] = await db.query(`
            SELECT
                expense_name,
                amount,
                expense_date,
                notes,
                created_by
            FROM
                expenses
        `);
        const [incomesData] = await db.query(`
            SELECT
                name,
                amount,
                date,
                notes,
                created_by
            FROM
                incomes
        `);
        const [bookingIncomeData] = await db.query(`
            SELECT
                CONCAT('Booking - ', customer_name, ' (', platform, ')') AS name,
                net_amount AS amount,
                booking_date AS date,
                CONCAT('Gross R', gross_amount, ', commission ', commission_rate, '% = R', commission_amount) AS notes,
                created_by
            FROM (${bookingIncomeSelect()}) booking_income
        `);

        const responseData = {
            incomes: [...incomesData, ...bookingIncomeData],
            expenses: expensesData

        };

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
