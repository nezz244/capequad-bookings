let cachedBookings = [];
let calendarCursor = startOfMonth(new Date());
let platformCommissions = [];
let platformAccounts = [];

document.addEventListener('DOMContentLoaded', async () => {
    setDefaultBookingFilters();
    attachListeners();
    await Promise.all([updateDashboard(), loadBookings(), loadPlatformCommissions(), loadPlatformAccounts()]);
});

function attachListeners() {
    document.getElementById('bookingButton')?.addEventListener('click', recordBooking);
    document.getElementById('quickBookingButton')?.addEventListener('click', recordBooking);
    document.getElementById('expensesButton')?.addEventListener('click', recordExpenses);
    document.getElementById('incomeButton')?.addEventListener('click', recordIncome);
    document.getElementById('settingsButton')?.addEventListener('click', openSettings);
    document.getElementById('refreshBookings')?.addEventListener('click', loadBookings);
    document.getElementById('bookingFrom')?.addEventListener('change', loadBookings);
    document.getElementById('bookingTo')?.addEventListener('change', loadBookings);
    document.getElementById('searchInput')?.addEventListener('input', renderBookings);
    document.getElementById('previousCalendarMonth')?.addEventListener('click', () => changeCalendarMonth(-1));
    document.getElementById('todayCalendarMonth')?.addEventListener('click', () => {
        calendarCursor = startOfMonth(new Date());
        setCalendarRangeInputs();
        loadBookings();
    });
    document.getElementById('nextCalendarMonth')?.addEventListener('click', () => changeCalendarMonth(1));
}

function setDefaultBookingFilters() {
    const fromInput = document.getElementById('bookingFrom');
    const toInput = document.getElementById('bookingTo');

    if (fromInput?.value) {
        calendarCursor = startOfMonth(new Date(`${fromInput.value}T00:00:00`));
    } else {
        setCalendarRangeInputs();
    }
}

function setCalendarRangeInputs() {
    const fromInput = document.getElementById('bookingFrom');
    const toInput = document.getElementById('bookingTo');
    const range = getCalendarMonthRange(calendarCursor);

    if (fromInput) fromInput.value = toDateInputValue(range.firstVisibleDay);
    if (toInput) toInput.value = toDateInputValue(range.lastVisibleDay);
}

function changeCalendarMonth(offset) {
    calendarCursor = startOfMonth(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1));
    setCalendarRangeInputs();
    loadBookings();
}

function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

async function updateDashboard() {
    try {
        const response = await fetch('/finance/summary');
        const summary = await response.json();

        setMoneyText('currentBalance', summary.balance);
        setMoneyText('bookingGrossIncome', summary.bookingGrossIncome);
        setMoneyText('bookingCommission', summary.bookingCommission);
    } catch (error) {
        console.error('Error updating dashboard:', error);
    }
}

async function loadPlatformCommissions() {
    try {
        const response = await fetch('/platform-commissions');

        if (!response.ok) {
            throw new Error('Could not load commission settings');
        }

        platformCommissions = await response.json();
    } catch (error) {
        console.error('Error loading commission settings:', error);
        platformCommissions = [];
    }
}

async function loadPlatformAccounts() {
    try {
        const response = await fetch('/platform-accounts');

        if (!response.ok) {
            throw new Error('Could not load platform accounts');
        }

        platformAccounts = await response.json();
    } catch (error) {
        console.error('Error loading platform accounts:', error);
        platformAccounts = [];
    }
}

async function loadBookings() {
    const from = document.getElementById('bookingFrom')?.value;
    const to = document.getElementById('bookingTo')?.value;
    const params = new URLSearchParams();

    if (from) params.set('from', from);
    if (to) params.set('to', to);

    try {
        const response = await fetch(`/bookings?${params.toString()}`);

        if (!response.ok) {
            throw new Error('Could not load bookings');
        }

        cachedBookings = await response.json();
        renderBookings();
        renderCalendar();
        updateBookingStats();
    } catch (error) {
        console.error('Error loading bookings:', error);
        showMessage('Could not load bookings. Check that the server and database are running.', 'danger');
    }
}

function renderBookings() {
    const tbody = document.querySelector('#bookingsTable tbody');
    const searchTerm = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';

    if (!tbody) return;

    const bookings = cachedBookings.filter((booking) => {
        if (!searchTerm) return true;

        return [
            booking.customer_name,
            booking.phone,
            booking.platform,
            booking.account_name,
            booking.product_name,
            booking.location,
            booking.payment_status,
        ].filter(Boolean).join(' ').toLowerCase().includes(searchTerm);
    });

    if (bookings.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="12" class="text-center text-muted py-4">No bookings found for this range.</td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = bookings.map((booking) => `
        <tr>
            <td>${escapeHtml(formatDate(booking.booking_date))}</td>
            <td>${escapeHtml(booking.start_time)}</td>
            <td>
                <strong>${escapeHtml(booking.customer_name)}</strong>
                ${booking.location ? `<div class="text-muted small">${escapeHtml(booking.location)}</div>` : ''}
            </td>
            <td>${escapeHtml(String(booking.pax))}</td>
            <td>
                ${escapeHtml(booking.platform)}
                ${booking.account_name ? `<div class="text-muted small">${escapeHtml(booking.account_name)}</div>` : ''}
            </td>
            <td>${escapeHtml(booking.product_name || '-')}</td>
            <td>${escapeHtml(booking.phone || '-')}</td>
            <td>${formatMoney(booking.gross_amount)}</td>
            <td>
                ${formatMoney(booking.commission_amount)}
                <div class="text-muted small">${formatPercent(booking.commission_rate)}</div>
            </td>
            <td><strong>${formatMoney(booking.net_amount)}</strong></td>
            <td>${escapeHtml(booking.created_by || '-')}</td>
            <td>${escapeHtml(booking.notes || '-')}</td>
        </tr>
    `).join('');
}

function renderCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarTitle = document.getElementById('calendarTitle');

    if (!calendarGrid) return;

    const range = getCalendarMonthRange(calendarCursor);
    const bookingsByDate = cachedBookings.reduce((groups, booking) => {
        groups[booking.booking_date] = groups[booking.booking_date] || [];
        groups[booking.booking_date].push(booking);
        return groups;
    }, {});
    const days = [];
    const cursor = new Date(range.firstVisibleDay);

    while (cursor <= range.lastVisibleDay) {
        days.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
    }

    if (calendarTitle) {
        calendarTitle.textContent = calendarCursor.toLocaleDateString('en-ZA', {
            month: 'long',
            year: 'numeric',
        });
    }

    calendarGrid.innerHTML = `
        ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => `
            <div class="calendar-weekday">${day}</div>
        `).join('')}
        ${days.map((day) => {
            const dateKey = toDateInputValue(day);
            const isOutsideMonth = day.getMonth() !== calendarCursor.getMonth();
            const isToday = dateKey === toDateInputValue(new Date());
            const dayBookings = (bookingsByDate[dateKey] || []).sort(compareBookingTimes);

            return `
                <div class="calendar-day ${isOutsideMonth ? 'is-muted' : ''} ${isToday ? 'is-today' : ''}">
                    <div class="calendar-day-header">
                        <span>${day.getDate()}</span>
                        ${dayBookings.length ? `<strong>${dayBookings.reduce((sum, booking) => sum + Number(booking.pax || 0), 0)} pax</strong>` : ''}
                    </div>
                    <div class="calendar-events">
                        ${dayBookings.map(renderCalendarEvent).join('')}
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function renderCalendarEvent(booking) {
    const platformClass = `platform-${normalisePlatformClass(booking.platform)}`;
    const title = [
        booking.customer_name,
        `${booking.pax}pax`,
        booking.phone,
        booking.product_name,
        booking.payment_status,
        booking.notes,
    ].filter(Boolean).join(' | ');

    return `
        <article class="calendar-event ${platformClass}" title="${escapeHtml(title)}">
            <div class="calendar-event-time">${escapeHtml(booking.start_time)}</div>
            <div class="calendar-event-main">
                <strong>${escapeHtml(booking.customer_name)}</strong>
                <span>${escapeHtml(booking.pax)}pax · ${escapeHtml(booking.platform)}</span>
            </div>
        </article>
    `;
}

function updateBookingStats() {
    const upcomingBookingsElement = document.getElementById('upcomingBookings');
    const upcomingPaxElement = document.getElementById('upcomingPax');
    const totalPax = cachedBookings.reduce((sum, booking) => sum + Number(booking.pax || 0), 0);

    if (upcomingBookingsElement) {
        upcomingBookingsElement.textContent = String(cachedBookings.length);
    }

    if (upcomingPaxElement) {
        upcomingPaxElement.textContent = String(totalPax);
    }
}

function recordBooking() {
    const today = toDateInputValue(new Date());
    const adminName = getAdminName();
    openPanel(`
        <div class="booking-panel">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h3 class="mb-0">Record Booking</h3>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="closePanel">Close</button>
            </div>
            <div class="row g-3">
                <div class="col-md-6">
                    <label for="customerName" class="form-label">Customer name</label>
                    <input type="text" id="customerName" class="form-control" placeholder="Simone" required>
                </div>
                <div class="col-md-3">
                    <label for="pax" class="form-label">Pax</label>
                    <input type="number" min="1" id="pax" class="form-control" value="2" required>
                </div>
                <div class="col-md-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input type="tel" id="phone" class="form-control" placeholder="+27...">
                </div>
                <div class="col-md-4">
                    <label for="platform" class="form-label">Platform</label>
                    <select id="platform" class="form-select" required>
                        <option value="GetYourGuide">GetYourGuide</option>
                        <option value="Fomo">Fomo</option>
                        <option value="Hyperli">Hyperli</option>
                        <option value="Ontours">Ontours</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Direct">Direct</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="accountName" class="form-label">Account</label>
                    <select id="accountName" class="form-select"></select>
                </div>
                <div class="col-md-4 d-none" id="customAccountWrap">
                    <label for="customAccountName" class="form-label">New account</label>
                    <input type="text" id="customAccountName" class="form-control" placeholder="Fomo account 2">
                </div>
                <div class="col-md-4">
                    <label for="productName" class="form-label">Product</label>
                    <input type="text" id="productName" class="form-control" placeholder="Quadbike waterfall">
                </div>
                <div class="col-md-4">
                    <label for="bookingDate" class="form-label">Date</label>
                    <input type="date" id="bookingDate" class="form-control" value="${today}" required>
                </div>
                <div class="col-md-4">
                    <label for="startTime" class="form-label">Start time</label>
                    <input type="time" id="startTime" class="form-control" value="11:00" required>
                </div>
                <div class="col-md-4">
                    <label for="durationMinutes" class="form-label">Duration</label>
                    <select id="durationMinutes" class="form-select">
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="location" class="form-label">Location</label>
                    <input type="text" id="location" class="form-control" placeholder="Grabouw">
                </div>
                <div class="col-md-4">
                    <label for="paymentStatus" class="form-label">Payment</label>
                    <select id="paymentStatus" class="form-select">
                        <option value="Paid online">Paid online</option>
                        <option value="Pay on arrival">Pay on arrival</option>
                        <option value="Deposit paid">Deposit paid</option>
                        <option value="Unpaid">Unpaid</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="amount" class="form-label">Amount</label>
                    <input type="number" min="0" step="0.01" id="amount" class="form-control" placeholder="2800">
                </div>
                <div class="col-md-6">
                    <label for="notes" class="form-label">Notes</label>
                    <input type="text" id="notes" class="form-control" placeholder="3 bikes, 2 buggy">
                </div>
                <div class="col-md-6">
                    <label class="form-label">Recorded by</label>
                    <div class="readonly-admin">${escapeHtml(adminName)}</div>
                </div>
            </div>
            <div class="d-flex align-items-center gap-2 mt-4">
                <button type="button" id="submitBooking" class="btn btn-primary">Save Booking</button>
                <span id="bookingFormStatus" class="text-muted"></span>
            </div>
        </div>
    `);

    document.getElementById('submitBooking')?.addEventListener('click', submitBooking);
    document.getElementById('closePanel')?.addEventListener('click', closePanel);
    document.getElementById('platform')?.addEventListener('change', updateAccountOptions);
    document.getElementById('accountName')?.addEventListener('change', toggleCustomAccount);
    updateAccountOptions();
}

async function submitBooking() {
    const status = document.getElementById('bookingFormStatus');
    const submitButton = document.getElementById('submitBooking');
    const booking = {
        customer_name: getValue('customerName'),
        pax: Number(getValue('pax')),
        phone: getValue('phone'),
        platform: getValue('platform'),
        account_name: getSelectedAccountName(),
        product_name: getValue('productName'),
        booking_date: getValue('bookingDate'),
        start_time: getValue('startTime'),
        duration_minutes: Number(getValue('durationMinutes')),
        location: getValue('location'),
        payment_status: getValue('paymentStatus'),
        amount: getValue('amount'),
        notes: getValue('notes'),
        created_by: getAdminName(),
    };

    if (status) status.textContent = 'Saving...';
    if (submitButton) submitButton.disabled = true;

    try {
        const response = await fetch('/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Could not save booking');
        }

        closePanel();
        await loadBookings();
        showMessage('Booking saved and added to the shared calendar.', 'success');
    } catch (error) {
        if (status) status.textContent = error.message;
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

function recordIncome() {
    const adminName = getAdminName();
    openPanel(`
        <div class="booking-panel">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h3 class="mb-0">Record Income</h3>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="closePanel">Close</button>
            </div>
            <label for="incomeName" class="form-label">Income name</label>
            <input type="text" id="incomeName" class="form-control mb-3">
            <label for="incomeAmount" class="form-label">Amount</label>
            <input type="number" min="0" step="0.01" id="incomeAmount" class="form-control mb-3">
            <label for="incomeDate" class="form-label">Date</label>
            <input type="date" id="incomeDate" class="form-control mb-3" value="${toDateInputValue(new Date())}">
            <label for="incomeNotes" class="form-label">Notes</label>
            <input type="text" id="incomeNotes" class="form-control mb-3">
            <label class="form-label">Recorded by</label>
            <div class="readonly-admin mb-3">${escapeHtml(adminName)}</div>
            <button type="button" id="submitIncome" class="btn btn-primary">Submit</button>
        </div>
    `);
    document.getElementById('submitIncome')?.addEventListener('click', submitIncome);
    document.getElementById('closePanel')?.addEventListener('click', closePanel);
}

async function submitIncome() {
    const newIncome = {
        name: getValue('incomeName'),
        amount: parseFloat(getValue('incomeAmount')),
        date: getValue('incomeDate'),
        notes: getValue('incomeNotes'),
        created_by: getAdminName(),
    };

    try {
        const response = await fetch('/incomes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newIncome),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Could not save income');
        }

        closePanel();
        await updateDashboard();
        showMessage('Income added successfully.', 'success');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

function recordExpenses() {
    const adminName = getAdminName();
    openPanel(`
        <div class="booking-panel">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <h3 class="mb-0">Record Expense</h3>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="closePanel">Close</button>
            </div>
            <label for="expenseName" class="form-label">Expense name</label>
            <input type="text" id="expenseName" class="form-control mb-3" placeholder="Fuel bikes">
            <label for="expenseAmount" class="form-label">Amount</label>
            <input type="number" min="0" step="0.01" id="expenseAmount" class="form-control mb-3">
            <label for="expenseDate" class="form-label">Date</label>
            <input type="date" id="expenseDate" class="form-control mb-3" value="${toDateInputValue(new Date())}">
            <label for="expenseNotes" class="form-label">Notes</label>
            <input type="text" id="expenseNotes" class="form-control mb-3">
            <label class="form-label">Recorded by</label>
            <div class="readonly-admin mb-3">${escapeHtml(adminName)}</div>
            <button type="button" id="submitExpense" class="btn btn-primary">Submit</button>
        </div>
    `);
    document.getElementById('submitExpense')?.addEventListener('click', submitExpense);
    document.getElementById('closePanel')?.addEventListener('click', closePanel);
}

async function submitExpense() {
    const newExpense = {
        name: getValue('expenseName'),
        amount: parseFloat(getValue('expenseAmount')),
        date: getValue('expenseDate'),
        notes: getValue('expenseNotes'),
        created_by: getAdminName(),
    };

    try {
        const response = await fetch('/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Could not save expense');
        }

        closePanel();
        await updateDashboard();
        showMessage('Expense added successfully.', 'success');
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

async function openSettings() {
    if (platformCommissions.length === 0) {
        await loadPlatformCommissions();
    }
    if (platformAccounts.length === 0) {
        await loadPlatformAccounts();
    }

    openPanel(`
        <div class="booking-panel settings-panel">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <p class="eyebrow mb-1">Settings</p>
                    <h3 class="mb-0">Platform commissions</h3>
                </div>
                <button type="button" class="btn btn-outline-secondary btn-sm" id="closePanel">Close</button>
            </div>
            <div class="settings-list">
                ${platformCommissions.map((commission) => `
                    <label class="commission-row">
                        <span>
                            <strong>${escapeHtml(commission.platform_name)}</strong>
                            <small>Deducted from gross booking amount</small>
                        </span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            class="commission-input"
                            data-platform="${escapeHtml(commission.platform_name)}"
                            value="${Number(commission.commission_rate).toFixed(2)}"
                        >
                        <em>%</em>
                    </label>
                `).join('')}
            </div>
            <hr class="settings-divider">
            <div class="d-flex align-items-center justify-content-between mb-3">
                <div>
                    <p class="eyebrow mb-1">Accounts</p>
                    <h3 class="mb-0">Platform accounts</h3>
                </div>
            </div>
            <div class="settings-list" id="accountSettingsList">
                ${platformAccounts.map(renderAccountSettingsRow).join('')}
            </div>
            <div class="add-account-row mt-3">
                <select id="newAccountPlatform" class="form-select">
                    ${getPlatformNames().map((platform) => `<option value="${escapeHtml(platform)}">${escapeHtml(platform)}</option>`).join('')}
                </select>
                <input id="newAccountName" type="text" class="form-control" placeholder="Account name">
                <input id="newAccountCommission" type="number" min="0" max="100" step="0.01" class="form-control" placeholder="Override %">
                <button type="button" id="addAccountRow" class="btn btn-outline-primary">Add Account</button>
            </div>
            <div class="d-flex align-items-center gap-2 mt-4">
                <button type="button" id="saveCommissions" class="btn btn-primary">Save Settings</button>
                <span id="settingsStatus" class="text-muted"></span>
            </div>
        </div>
    `);

    document.getElementById('closePanel')?.addEventListener('click', closePanel);
    document.getElementById('saveCommissions')?.addEventListener('click', saveCommissions);
    document.getElementById('addAccountRow')?.addEventListener('click', addAccountSettingsRow);
}

async function saveCommissions() {
    const status = document.getElementById('settingsStatus');
    const button = document.getElementById('saveCommissions');
    const commissions = [...document.querySelectorAll('.commission-input')].map((input) => ({
        platform_name: input.dataset.platform,
        commission_rate: Number(input.value),
    }));
    const accounts = [...document.querySelectorAll('.account-settings-row')].map((row) => {
        const commissionValue = row.querySelector('.account-commission-input').value.trim();
        return {
            platform_name: row.querySelector('.account-platform-input').value,
            account_name: row.querySelector('.account-name-input').value,
            commission_rate: commissionValue === '' ? null : Number(commissionValue),
            is_active: row.querySelector('.account-active-input').checked,
        };
    });

    if (status) status.textContent = 'Saving...';
    if (button) button.disabled = true;

    try {
        const response = await fetch('/platform-commissions', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                commissions,
                created_by: getAdminName(),
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Could not save settings');
        }

        platformCommissions = data.commissions;
        const accountsResponse = await fetch('/platform-accounts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                accounts,
                created_by: getAdminName(),
            }),
        });
        const accountsData = await accountsResponse.json();

        if (!accountsResponse.ok) {
            throw new Error(accountsData.error || 'Could not save account settings');
        }

        platformAccounts = accountsData.accounts;
        closePanel();
        await Promise.all([updateDashboard(), loadBookings()]);
        showMessage('Commission settings updated.', 'success');
    } catch (error) {
        if (status) status.textContent = error.message;
    } finally {
        if (button) button.disabled = false;
    }
}

function updateAccountOptions() {
    const platform = getValue('platform');
    const accountSelect = document.getElementById('accountName');
    if (!accountSelect) return;

    const accounts = platformAccounts.filter((account) => account.platform_name === platform && Number(account.is_active) === 1);
    accountSelect.innerHTML = `
        <option value="">No account</option>
        ${accounts.map((account) => `<option value="${escapeHtml(account.account_name)}">${escapeHtml(account.account_name)}</option>`).join('')}
        <option value="__custom__">Add new account...</option>
    `;
    toggleCustomAccount();
}

function toggleCustomAccount() {
    const accountSelect = document.getElementById('accountName');
    const customWrap = document.getElementById('customAccountWrap');
    if (!accountSelect || !customWrap) return;

    customWrap.classList.toggle('d-none', accountSelect.value !== '__custom__');
}

function getSelectedAccountName() {
    const accountValue = getValue('accountName');
    return accountValue === '__custom__' ? getValue('customAccountName') : accountValue;
}

function renderAccountSettingsRow(account) {
    const commissionValue = account.commission_rate == null ? '' : Number(account.commission_rate).toFixed(2);
    return `
        <label class="commission-row account-settings-row">
            <span>
                <strong>${escapeHtml(account.account_name)}</strong>
                <small>${escapeHtml(account.platform_name)} account</small>
            </span>
            <input type="hidden" class="account-platform-input" value="${escapeHtml(account.platform_name)}">
            <input type="hidden" class="account-name-input" value="${escapeHtml(account.account_name)}">
            <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="account-commission-input"
                value="${commissionValue}"
                placeholder="Default"
            >
            <span class="account-active-cell">
                <input type="checkbox" class="account-active-input" ${Number(account.is_active) === 1 ? 'checked' : ''}>
                <em>Active</em>
            </span>
        </label>
    `;
}

function addAccountSettingsRow() {
    const platform = getValue('newAccountPlatform');
    const accountName = getValue('newAccountName');
    const commissionValue = getValue('newAccountCommission');
    const list = document.getElementById('accountSettingsList');

    if (!platform || !accountName || !list) return;

    const exists = [...document.querySelectorAll('.account-settings-row')].some((row) => (
        row.querySelector('.account-platform-input').value.toLowerCase() === platform.toLowerCase() &&
        row.querySelector('.account-name-input').value.toLowerCase() === accountName.toLowerCase()
    ));

    if (exists) return;

    list.insertAdjacentHTML('beforeend', renderAccountSettingsRow({
        platform_name: platform,
        account_name: accountName,
        commission_rate: commissionValue === '' ? null : Number(commissionValue),
        is_active: 1,
    }));
    document.getElementById('newAccountName').value = '';
    document.getElementById('newAccountCommission').value = '';
}

function getPlatformNames() {
    const platforms = platformCommissions.map((commission) => commission.platform_name);
    return platforms.length ? platforms : ['GetYourGuide', 'Fomo', 'Hyperli', 'Ontours', 'Walk-in', 'Direct', 'Other'];
}

function openPanel(html) {
    const listContainer = document.getElementById('listContainer');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="panel-overlay">
            ${html}
        </div>
    `;
}

function closePanel() {
    const listContainer = document.getElementById('listContainer');
    if (listContainer) {
        listContainer.innerHTML = '';
    }
}

function showMessage(message, type = 'info') {
    const listContainer = document.getElementById('listContainer');
    if (!listContainer) return;

    listContainer.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
            ${escapeHtml(message)}
            <button type="button" class="btn-close" aria-label="Close"></button>
        </div>
    `;
    listContainer.querySelector('.btn-close')?.addEventListener('click', closePanel);
}

function getValue(id) {
    return document.getElementById(id)?.value.trim() || '';
}

function getAdminName() {
    return window.currentAdmin?.name || localStorage.getItem('currentAdminName') || 'Unknown admin';
}

function setMoneyText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = Number(value || 0).toFixed(2);
    }
}

function formatMoney(value) {
    return `R${Number(value || 0).toFixed(2)}`;
}

function formatPercent(value) {
    return `${Number(value || 0).toFixed(2)}%`;
}

function formatDate(value) {
    if (!value) return '';

    const date = new Date(`${value}T00:00:00`);
    return date.toLocaleDateString('en-ZA', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getCalendarMonthRange(date) {
    const monthStart = startOfMonth(date);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const firstVisibleDay = new Date(monthStart);
    const lastVisibleDay = new Date(monthEnd);

    firstVisibleDay.setDate(monthStart.getDate() - monthStart.getDay());
    lastVisibleDay.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

    return { firstVisibleDay, lastVisibleDay };
}

function compareBookingTimes(a, b) {
    return String(a.start_time).localeCompare(String(b.start_time));
}

function normalisePlatformClass(platform) {
    return String(platform || 'other')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'other';
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
