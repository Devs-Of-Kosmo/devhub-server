// utils.js

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function clearCheckIconAndMessage() {
    const checkIcon = document.querySelector('.check-icon');
    const uploadMessage = document.querySelector('.upload-message');
    if (checkIcon) checkIcon.remove();
    if (uploadMessage) uploadMessage.remove();
}

function clearCommitSuccessMessage() {
    const successMessage = document.querySelector('.commit-success-message');
    const checkIcon = document.querySelector('.check-icon');
    if (successMessage) successMessage.remove();
    if (checkIcon) checkIcon.remove();
}

function clearCommitMessage() {
    const commitMessageInput = document.getElementById('commitMessage');
    if (commitMessageInput) {
        commitMessageInput.value = '';
    }
}

function resetFileInput(inputId) {
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
        fileInput.value = '';
        setTimeout(() => fileInput.click(), 100);
    }
}

function showCheckIcon(button, message = '') {
    let checkIcon = button.parentElement.querySelector('.check-icon');
    if (!checkIcon) {
        checkIcon = document.createElement('span');
        checkIcon.className = 'check-icon';
        checkIcon.style.marginLeft = '10px';
        button.insertAdjacentElement('afterend', checkIcon);
        setTimeout(() => checkIcon.classList.add('show'), 100);
    }

    let uploadMessage = button.parentElement.querySelector('.upload-message');
    if (!uploadMessage && message) {
        uploadMessage = document.createElement('span');
        uploadMessage.className = 'upload-message';
        uploadMessage.style.marginLeft = '10px';
        uploadMessage.textContent = message;
        checkIcon.insertAdjacentElement('beforebegin', uploadMessage);
    }
}
