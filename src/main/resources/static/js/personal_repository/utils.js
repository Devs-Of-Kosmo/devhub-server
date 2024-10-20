// utils.js

// HTML 이스케이프 함수
function escapeHtml(unsafe) {
    const map = {
        '&': "&amp;",
        '<': "&lt;",
        '>': "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return unsafe.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// 체크 아이콘과 메시지를 제거하는 함수
function clearCheckIconAndMessage() {
    const checkIcon = document.querySelector('.check-icon');
    const uploadMessage = document.querySelector('.upload-message');
    if (checkIcon) checkIcon.remove();
    if (uploadMessage) uploadMessage.remove();
}

// 커밋 메시지 입력 필드 내용을 지우는 함수
function clearCommitMessage() {
    const commitMessageInput = document.getElementById('commitMessage');
    if (commitMessageInput) {
        commitMessageInput.value = '';
    }
}

// 파일 입력 필드를 초기화하는 함수
function resetFileInput(inputId) {
    const fileInput = document.getElementById(inputId);
    if (fileInput) {
        fileInput.value = '';
        setTimeout(() => fileInput.click(), 100);
    }
}

// 파일 업로드 후 체크 아이콘과 메시지를 표시하는 함수
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
