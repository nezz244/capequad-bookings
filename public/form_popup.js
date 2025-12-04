// formPopupUtils.js
export function showFormPopup(formHTML, scale = 0.8) {
    const listContainer = document.getElementById('listContainer');
    listContainer.innerHTML = formHTML;
    // Apply the styles for the popup
    const popup = document.querySelector('.form-popup');
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = `translate(-50%, -50%) scale(${scale})`;
    popup.style.backgroundColor = '#fff';
    popup.style.padding = '30px';
    popup.style.borderRadius = '8px';
    popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    popup.style.zIndex = '1000';
    popup.style.maxWidth = '400px';
    popup.style.width = '90%';
    // Add a semi-transparent overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    overlay.style.zIndex = '999';
    document.body.appendChild(overlay);
    // Modernizing form fields and buttons
    const formInputs = document.querySelectorAll('.form-input');
    formInputs.forEach(input => {
        input.style.width = '100%';
        input.style.padding = '10px';
        input.style.marginBottom = '15px';
        input.style.border = '1px solid #ccc';
        input.style.borderRadius = '5px';
        input.style.fontSize = '16px';
        input.style.transition = 'border-color 0.3s ease';
        input.addEventListener('focus', () => {
            input.style.borderColor = '#007BFF';
            input.style.outline = 'none';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = '#ccc';
        });
    });
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.padding = '10px 20px';
        button.style.marginTop = '10px';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '16px';
        button.style.transition = 'background-color 0.3s ease';

        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#0056b3';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007BFF';
        });
    });
    // Close button event
    const closeBtn = document.getElementById('closeForm');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            resetView();
            document.body.removeChild(overlay);
        });
    }
}
