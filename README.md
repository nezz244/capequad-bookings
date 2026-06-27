# capeadrenaline_management

Admin system for recording quad biking bookings from platforms such as GetYourGuide, Fomo, Hyperli, Ontours, walk-ins, and direct customers.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the MySQL values.

3. Start the server:

   ```bash
   npm start
   ```

4. Open `http://localhost:3002`.

The server creates the `bookings` table automatically when MySQL is reachable. Existing `incomes` and `expenses` tables are still used by the dashboard.

## Shared calendar

The web app has its own shared calendar. When an admin records a booking, it is saved to MySQL and appears immediately in the in-app monthly calendar and booking log for every admin using the same Railway database.

No Google account, Google Calendar, service account, or external calendar API is required.

## Commissions and recorded-by

Booking income is calculated from platform commission settings:

- GetYourGuide: 34%
- Fomo: 25%
- Hyperli: 20%
- Ontours, Walk-in, Direct, Other: 0%

Admins can change these in the in-app Settings screen. Financial summaries use net booking income: gross booking amount minus platform commission.

Bookings, manual income, expenses, and commission setting changes are stamped with the logged-in Firebase account name/email so records show who created them.

Each platform can also have multiple accounts, for example separate Fomo, Hyperli, or GetYourGuide accounts. Account-level commission overrides can be set in Settings; when an account override is blank, the platform default commission is used.
