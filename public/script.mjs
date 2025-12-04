import {showFormPopup} from "./form_popup.js";
function closePopup() {
    const popup = document.querySelector('.popup-overlay');
    if (popup) {
        popup.remove();
    }
}
// Attach event listeners on page load
document.addEventListener('DOMContentLoaded', async () => {
    await updateDashboard();
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
document.getElementById('incomeButton').addEventListener('click', recordIncome);

    //document.getElementById('logoutButton').addEventListener('click', logoutUser);
}
async function updateDashboard() {
        try {
            // Fetch the total income from other sources
            const incomeResponse = await fetch('/chacco/incomes/total');
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
    document.getElementById('closeIncomeForm').addEventListener('click', async () => {
        const popup = document.querySelector('.form-popup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup); // remove from actual parent
            await updateDashboard();
        }

    });

    document.getElementById('submitIncome').addEventListener('click', submitIncome);
}
// Submit New Client Data
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
        .then(async () => {
            alert('Expense added successfully!');
            await updateDashboard()
        })
        .catch(error => console.error('Error adding new expense:', error));
}
function submitIncome() {
    const incomeName = document.getElementById('incomeName').value;
    const incomeAmount = document.getElementById('incomeAmount').value;
    const incomeDate = document.getElementById('incomeDate').value;
    const incomeNotes = document.getElementById('incomeNotes').value;

    const newIncome = {
        name: incomeName,
        amount: parseFloat(incomeAmount),
        date: incomeDate,
        notes: incomeNotes,
    };

    fetch('/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIncome)
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.status !== 204 ? response.json() : {};
        })
        .then(() => {
            alert('Income added successfully!');
            // Close the overlay
            const overlay = document.getElementById('incomeFormOverlay');
            if (overlay) overlay.style.display = 'none';
            // Refresh the page
            location.reload();
        })
        .catch(error => console.error('Error adding new income:', error));
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
    document.getElementById('closeExpenseForm').addEventListener('click', async () => {
        const popup = document.querySelector('.form-popup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup); // remove from actual parent
            await updateDashboard();
        }
    });

    document.getElementById('submitExpense').addEventListener('click', submitExpense);
}