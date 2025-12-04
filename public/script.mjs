import {showFormPopup} from "./form_popup.js";
function closePopup() {
    const popup = document.querySelector('.popup-overlay');
    if (popup) {
        popup.remove();
    }
}
// Attach event listeners on page load
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    attachListeners();
    enableSearch(); // Initialize the search functionality
});
function enableSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.valueOf()
        fetchAndFilterClients(searchTerm);
    });
}
// Function to fetch and filter clients
function fetchAndFilterClients(searchTerm) {
    const searchInput = searchTerm;
    // Fetch all clients from the API
    fetch('/chacco-all')
        .then(response => response.json())
        .then(data => {
            // Ensure data is an array
            if (Array.isArray(data)) {
                // Trim search term and client names to remove extra whitespace
                const trimmedSearchTerm = String(searchInput.value).trim().toLowerCase();
                const filteredClients = data.filter(client => {
                    // Access client_name correctly (from your data structure)
                    const clientName = client.client_name.trim().toLowerCase();
                    return clientName.includes(trimmedSearchTerm);
                });
                // Display filtered clients
                displayClients(filteredClients);
            }
            else {
                console.error('Expected an array but received:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching clients:', error);
        });
}
// Real-time search as the user types
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchTerm = event.target.valueOf();
    fetchAndFilterClients(searchTerm);
});
function displayClients(clients) {
    const listContainer = document.getElementById('listContainer');
    const searchInput = document.getElementById('searchInput');
    if (!listContainer) {
        console.error("listContainer element not found");
        return;
    }
    if (!searchInput) {
        console.error("searchInput element not found");
        return;
    }
    // Check for empty search input
    if (searchInput.value.trim() === '') {
        listContainer.innerHTML = ''; // Clear the list container if there's no text
        return;
    }
    // Create the table structure
    let listHTML = `
    <div class="clients-popup-container">
        <div class="clients-popup">
            <h3>Clients List</h3>
            <table class="clients-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>`;
    // Add each client as a row in the table
    clients.forEach(client => {
        listHTML += `
            <tr>
                <td>${client.client_name}</td>
                <td><button class="btn details-btn" data-id="${client.client_id}">Details</button></td>
            </tr>`;
    });
    listHTML += `</tbody></table>
        </div>
    </div>`;
    // Display the filtered clients
    listContainer.innerHTML = listHTML;
    // Add event listener for details button
    listContainer.addEventListener('click', handleDetailsButtonClick);
    // Style the table with modern design
    const table = document.querySelector('.clients-table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '20px';
    const thElements = table.querySelectorAll('th');
    thElements.forEach(th => {
        th.style.padding = '12px';
        th.style.textAlign = 'left';
        th.style.backgroundColor = '#f4f4f4';
        th.style.borderBottom = '2px solid #ddd';
        th.style.fontWeight = 'bold';
    });
    const tdElements = table.querySelectorAll('td');
    tdElements.forEach(td => {
        td.style.padding = '10px';
        td.style.borderBottom = '1px solid #ddd';
    });
    // Style the buttons
    const buttons = document.querySelectorAll('.details-btn');
    buttons.forEach(button => {
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.padding = '8px 16px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.transition = 'background-color 0.3s ease';
        // Hover effect for buttons
        button.addEventListener('mouseenter', function () {
            button.style.backgroundColor = '#0056b3';
        });
        button.addEventListener('mouseleave', function () {
            button.style.backgroundColor = '#007BFF';
        });
    });
    // Style the popup container to be centered and float on the screen
    const popupContainer = document.querySelector('.clients-popup-container');
    popupContainer.style.position = 'fixed';
    popupContainer.style.top = '0';
    popupContainer.style.left = '0';
    popupContainer.style.width = '100%';
    popupContainer.style.height = '100%';
    popupContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    popupContainer.style.display = 'flex';
    popupContainer.style.justifyContent = 'center';
    popupContainer.style.alignItems = 'center';
    popupContainer.style.zIndex = '9999'; // Ensure it sits above other content
    // Style the actual popup
    const popup = document.querySelector('.clients-popup');
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 10px rgba(0, 0, 0, 0.1)';
    popup.style.maxWidth = '800px';
    popup.style.width = '100%';
    popup.style.maxHeight = '80vh'; // Limit the height to 80% of the viewport height
    popup.style.overflowY = 'auto'; // Add vertical scroll if content overflows
    // Optionally, add a close button to dismiss the popup
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.backgroundColor = '#f44336';
    closeButton.style.color = '#fff';
    closeButton.style.padding = '8px 16px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '5px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.addEventListener('click', () => {
        listContainer.innerHTML = ''; // Clear the list container to remove the popup
    });
    popup.appendChild(closeButton);
}
function handleDetailsButtonClick(event) {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.id) {
        showDetails(parseInt(event.target.dataset.id, 10)); // Access the correct data-id
    }
}
function attachListeners() {
document.getElementById('expensesButton').addEventListener('click', recordExpenses);
document.getElementById('income').addEventListener('click', recordIncome);

    //document.getElementById('logoutButton').addEventListener('click', logoutUser);
}
async function updateDashboard() {
        try {
            // Fetch the total income from other sources
            const incomeResponse = await fetch('https://www.chaccooffice.org/chacco/incomes/total');
            const totalIncomeData = await incomeResponse.json();
            const totalIncome = parseFloat(totalIncomeData.totalIncome) || 0;
            console.log("total income",totalIncome);
            // Fetch the total expenses
            const expensesResponse = await fetch('/chacco/expenses/total');
            const expensesTotal = await expensesResponse.json();
            console.log("expensesTotal",expensesTotal);

            // ✅ Calculate total balance
            const totalBalance =  totalIncome - expensesTotal.total;
            // Update the dashboard
            document.getElementById('currentBalance').textContent = totalBalance.toFixed(2);
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }
function recordIncome() {
    const formHTML = `
    <div class="form-popup">
        <h3>Record Income</h3>
        <label for="incomeName">Income Name:</label>
        <input type="text" id="incomeName" class="form-input"><br>
        
        <label for="incomeAmount">income Amount:</label>
        <input type="text" id="incomeAmount" class="form-input"><br>
        
        <label for="incomeDate">Income Date:</label>
        <input type="date" id="incomeDate" class="form-input"><br>
        
        <label for="incomeNotes">Notes:</label>
        <input type="text" id="incomeNotes" class="form-input"><br>
        
        <button type="button" id="submitIncome" class="btn">Submit</button>
        <button type="button" id="closeIncomeForm" class="btn">Cancel</button>
    </div>`;
    showFormPopup(formHTML, 0.7); // you can tweak the scale value

    // Event listeners for close button
    document.getElementById('closeIncomeForm').addEventListener('click', () => {
        updateDashboard();
        document.body.removeChild(overlay);
    });
    document.getElementById('submitIncome').addEventListener('click', submitIncome);
}
// Submit New Client Data
function submitNewClient() {
        const clientName = document.getElementById('clientName').value;
        const source = document.getElementById('source').value;
        const referredBy = document.getElementById('referredBy').value;
        const amountPaid = document.getElementById('ammountPaid').value; // Fixed incorrect field name
        const assistedBy = document.getElementById('assistedBy').value;
        const totalAmount = document.getElementById('totalAmount').value;
        const dateJoined = document.getElementById('dateJoined').value;
        const address = document.getElementById('address').value;
        const phoneNumber = document.getElementById('phoneNumber').value;
        // Convert the dateJoined to CAT (UTC +2)
        const date = new Date(dateJoined);
        date.setHours(date.getHours() + 2);  // Add 2 hours to UTC to get CAT
        // Format the date as a string in the ISO format (e.g., "2024-11-28T22:00:00.000+02:00")
        const formattedDate = date.toISOString().replace('Z', '+02:00'); // Adjust for CAT time zone
        const newClient = {
            name: clientName,
            category: source,
            referredBy: referredBy,
            amountPaid: parseFloat(amountPaid), // Fixed incorrect field name
            assistedBy: assistedBy,
            totalAmount: parseFloat(totalAmount),
            dateJoined: formattedDate,  // Use the formatted date in CAT
            address: address,
            phoneNumber: phoneNumber,
        };
        fetch('/chacco/new_client', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newClient)
        })
            .then(response => response.json())
            .then(() => {
                alert('Client added successfully!');

                updateDashboard();
            })
            .catch(error => console.error('Error adding new client:', error));

        function resetView() {
            // Remove the popup if it exists
            const popup = document.querySelector('.form-popup');
            if (popup && popup.parentNode) {
                popup.parentNode.removeChild(popup);
                // Refresh the page
                window.location.reload();
            }

            // Remove the overlay if it exists
            const overlay = document.querySelector('.popup-overlay');
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
                // Refresh the page
                window.location.reload();
            }

        }

    }

function submitExpense() {
    const expenseName = document.getElementById('expenseName').value;
    const expenseAmount = document.getElementById('expenseAmount').value;
    const expenseDate = document.getElementById('expenseDate').value;
    const expenseNotes = document.getElementById('expenseNotes').value;

    const newExpense = {
        name: expenseName,  // Change from 'expenseName' to 'name'
        amount: parseFloat(expenseAmount),  // 'amount' is already correct
        date: expenseDate,  // Change from 'expenseDate' to 'date'
        notes: expenseNotes,  // Change from 'expenseNotes' to 'notes'
    };

    fetch('/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newExpense)
    })
        .then(response => response.json())
        .then(() => {
            alert('Expense added successfully!');
            updateDashboard()
        })
        .catch(error => console.error('Error adding new expense:', error));
}
// Attach event listeners
function showList(filter) {
    // Construct the API URL with the filter query parameter
    const url = `/chacco/civil-servants?filter=${filter}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const filteredServants = data;
            // Create the table HTML structure
            let listHTML = `
                <div id="popupDetails" class="popup-overlay" onclick="if(event.target === this) closePopup()">
                    <div class="popup-content">
                        <h3>Clients List</h3>
                        <table class="styled-table">
                            <thead>
                                <tr><th>Name</th><th>Action</th></tr>
                            </thead>
                            <tbody>`;
            filteredServants.forEach(client => {
                listHTML += `
                    <tr>
                        <td>${client.client_name}</td> <!-- Correct property name -->
                        <td><button data-id="${client.client_id}" class="details-button">Details</button></td>
                    </tr>`;
            });
            listHTML += `</tbody></table>
                        <button class="close-popup" onclick="closePopup()">Close</button>
                    </div>
                </div>`;
            // Display the list in the popup container
            const listContainer = document.body;
            listContainer.insertAdjacentHTML('beforeend', listHTML);
            // Close popup event listener
            document.getElementById('popupDetails').addEventListener('click', () => {
                document.getElementById('popupDetails').remove();
            });
            // Add event listener for details button
            document.querySelectorAll('.details-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    // Use event.target.closest to find the button
                    const targetButton = event.target.closest('button');
                    if (targetButton) {
                        const id = targetButton.dataset.id; // Access the data-id attribute
                        if (id) {
                            showDetails(parseInt(id, 10)); // Ensure id is an integer
                        } else {
                            console.error('data-id attribute is missing or invalid.');
                        }
                    } else {
                        console.error('No button element found in the event target.');
                    }
                });
            });
        })
        .catch(error => {
            console.error('Error fetching civil servants:', error);
        });
}
function showDetails(id) {
    let nezz;
    fetch(`/chacco/${id}`)
        .then(response => response.json())
        .then(civilServant => {
            fetch(`/chacco/${id}/installments`)
                .then(response => response.json())
                .then(installments => {
                    nezz = civilServant.client_name;
                    // ✅ Calculate financials
                    const installmentTotal = installments.reduce((sum, inst) => sum + parseFloat(inst.amount), 0);
                    const amountPaid = parseFloat(civilServant.amount_paid || 0); // <- NEW: Get value from clients table
                    const totalPaid = installmentTotal + amountPaid; // <- UPDATED: Include both
                    const totalToPay = parseFloat(civilServant.total_amount_to_pay || 0);
                    const balance = totalToPay - totalPaid;
                    const moneyOwing = balance > 0 ? balance : 0;

                    // ✅ Format date_joined
                    const joinedDate = civilServant.date_joined
                        ? new Date(civilServant.date_joined).toLocaleDateString()
                        : 'N/A';

                    // ✅ Close existing popup if any
                    const existingClientsPopup = document.querySelector('.clients-popup-container');
                    if (existingClientsPopup) {
                        existingClientsPopup.remove();
                    }

                    const detailsHTML = `
                        <div id="popupDetails" class="popup-overlay">
                            <div class="popup-content">
                                <h3>${civilServant.client_name}</h3>

                                <!-- ✅ Financial Summary Section -->
                                <div class="financial-summary">
                                    <p><strong>Stand Number:</strong> ${civilServant.stand_number || 'N/A'}</p>
                                    <p><strong>Date Joined:</strong> ${joinedDate}</p>
                                    <p><strong>Deposit Paid:</strong> ${amountPaid}</p>
                                    <p><strong>Total Paid to Date:</strong> $${totalPaid.toFixed(2)}</p>
                                    <p><strong>Balance Remaining:</strong> $${balance.toFixed(2)}</p>
                                    <p><strong>Money Owing:</strong> $${moneyOwing.toFixed(2)}</p>
                                </div>

                                <p>Installments:</p>
                                <table class="styled-table">
                                    <thead>
                                        <tr><th>Amount</th><th>Date</th></tr>
                                    </thead>
                                    <tbody>
                                        ${installments.map(inst => `
                                            <tr>
                                                <td>${inst.amount}</td>
                                                <td>${inst.installment_date}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>

                                <h4>Record New Installment</h4>
                                <form id="installmentForm">
                                    <div class="form-group">
                                        <label for="installmentAmount">Amount:</label>
                                        <input type="number" id="installmentAmount" class="form-control">
                                    </div>
                                    <div class="form-group">
                                        <label for="installmentDate">Date:</label>
                                        <input type="date" id="installmentDate" class="form-control">
                                    </div>
                                    <button type="button" id="recordInstallment" class="details-button">Submit</button>
                                    <button id="closePopup" class="details-button" onclick="closePopup()">Close</button>
                                </form>
                            </div>
                        </div>`;

                    document.body.insertAdjacentHTML('beforeend', detailsHTML);

                    // Close popup listener
                    document.getElementById('closePopup').addEventListener('click', () => {
                        document.getElementById('popupDetails').remove();
                    });

                    // Submit form listener
                    // Handle form submission
                    document.getElementById('recordInstallment').addEventListener('click', () => {
                        const amount = parseFloat(document.getElementById('installmentAmount').value);
                        const date = document.getElementById('installmentDate').value;
                        const name = nezz;

                        if (isNaN(amount) || amount <= 0) {
                            return alert('Please enter a valid positive amount.');
                        }
                        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                            return alert('Please enter a valid date in YYYY-MM-DD format.');
                        }

                        // ✅ First: Record the installment
                        fetch(`/chacco/${id}/installments`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ amount, date, name })
                        })
                            .then(response => response.json())
                            .then(() => {
                                alert('Installment recorded successfully!');

                                // ✅ Second: Update paid_this_month to 1
                                return fetch(`/chacco/${id}/mark-paid`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' }
                                });
                            })
                            .then(() => {
                                // ✅ Refresh UI after marking as paid
                                showDetails(id);
                                updateDashboard();
                            })
                            .catch(error => {
                                console.error('Error recording installment or updating payment status:', error);
                                alert('Something went wrong while recording the installment.');
                            });
                    });
                });
        });
}
// Add a new customer
function addNewCustomer() {
    const formHTML = `
    <div class="form-popup">
        <h3>Add New Client</h3>
        <label for="clientName">Client Name:</label>
        <input type="text" id="clientName" class="form-input"><br>
        <label for="source">Source:</label>
        <input type="text" id="source" class="form-input"><br> 
        <label for="referredBy">Referred By:</label>
        <input type="text" id="referredBy" class="form-input"><br>
        <label for="ammountPaid">Amount Paid:</label>
        <input type="number" id="ammountPaid" class="form-input"><br>
        <label for="assistedBy">Assisted By:</label>
        <input type="text" id="assistedBy" class="form-input"><br>
        <label for="totalAmount">Total Amount To Pay:</label>
        <input type="number" id="totalAmount" class="form-input"><br>
        <label for="phoneNumber">Phone Number:</label>
        <input type="number" id="phoneNumber" class="form-input"><br>
        <label for="address">Address:</label>
        <input type="text" id="address" class="form-input"><br>
        <label for="dateJoined">Date:</label>
        <input type="date" id="dateJoined" class="form-input"><br>
        <button type="button" id="submitNewClient" class="btn">Submit</button>
        <button type="button" id="closeForm" class="btn">Cancel</button>
    </div>`;
    showFormPopup(formHTML, 0.7); // you can tweak the scale value
    // Event listeners for close button
    document.getElementById('closeForm').addEventListener('click', () => {
        updateDashboard();
        document.body.removeChild(overlay);
    });
    // Ensure submitNewClient event listener is added only after DOM content is ready
    document.getElementById('submitNewClient').addEventListener('click', submitNewClient);
}
function recordExpenses() {
    const formHTML = `
    <div class="form-popup">
        <h3>Record Expense</h3>
        <label for="expenseName">Expense Name:</label>
        <input type="text" id="expenseName" class="form-input"><br>
        
        <label for="expenseAmount">Expense Amount:</label>
        <input type="text" id="expenseAmount" class="form-input"><br>
        
        <label for="expenseDate">Date:</label>
        <input type="date" id="expenseDate" class="form-input"><br>
        
        <label for="expenseNotes">Notes:</label>
        <input type="text" id="expenseNotes" class="form-input"><br>
        
        <button type="button" id="submitExpense" class="btn">Submit</button>
        <button type="button" id="closeExpenseForm" class="btn">Cancel</button>
    </div>`;
    showFormPopup(formHTML, 0.7); // you can tweak the scale value


    // Event listeners for close button
    document.getElementById('closeExpenseForm').addEventListener('click', () => {
        updateDashboard();
        document.body.removeChild(overlay);
    });
    document.getElementById('submitExpense').addEventListener('click', submitExpense);
}