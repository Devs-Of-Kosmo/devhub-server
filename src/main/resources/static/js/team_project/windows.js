// 모든 창 닫기
function closeAllWindows() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.style.display = 'none';
    });
}

// 특정 창 열기
function openWindow(id) {
    closeAllWindows();
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.style.display = 'block';
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

// 특정 창 닫기
function closeWindow(id) {
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
function handleIconClick(icon, windowId) {
    openWindow(windowId);
}