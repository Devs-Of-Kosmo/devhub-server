// 모든 창 닫기
window.closeAllWindows = function() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.style.display = 'none';
    });
}

// 특정 창 열기
window.openWindow = function(id) {
    window.closeAllWindows();
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.style.display = 'block';
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

// 특정 창 닫기
window.closeWindow = function(id) {
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.style.display = 'none';
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

// 닫기 버튼 기능 추가
document.addEventListener('DOMContentLoaded', function() {
    const closeButtons = document.querySelectorAll('.close-button');

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const window = this.closest('.window') || this.closest('.modal');
            if (window) {
                window.style.display = 'none';
            }
        });
    });
});

// 아이콘 클릭 이벤트 핸들러
window.handleIconClick = function(icon, windowId) {
    window.openWindow(windowId);
}