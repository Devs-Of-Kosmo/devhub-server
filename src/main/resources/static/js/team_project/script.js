
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

function closeAllWindows() {
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
        window.style.display = 'none';
    });
}

function openWindow(id) {
    closeAllWindows();
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.style.display = 'block';
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

function closeWindow(id) {
    const windowElement = document.getElementById(id);
    if (windowElement) {
        windowElement.style.display = 'none';
    } else {
        console.error(`Element with id "${id}" not found`);
    }
}

function handleIconClick(icon, windowId) {
    document.querySelectorAll('#Desktop .icon').forEach(el => el.classList.remove('clicked'));
    icon.classList.add('clicked');
    setTimeout(() => {
        openWindow(windowId);
        icon.classList.remove('clicked');
    }, 300);
}

function createNewProject() {
    const projectName = document.getElementById('projectName').value;
    const projectDescription = document.getElementById('projectDescription').value;

    if (projectName) {
        const desktop = document.getElementById('Desktop');
        const newProjectIcon = document.createElement('div');
        newProjectIcon.className = 'icon';

        // 여기서 folderName 변수를 projectName으로 설정
        const folderName = projectName;

        newProjectIcon.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/716/716784.png" alt="${projectName}">
            <span class="title">${projectName}</span>
        `;
        newProjectIcon.onclick = function() {
            // 폴더 이름에 따라 URL로 이동
            window.location.href = `/team_project_list/${folderName}`;
        };
        desktop.appendChild(newProjectIcon);

        const projectList = document.getElementById('projectList');
        const listItem = document.createElement('li');
        listItem.textContent = projectName;
        projectList.appendChild(listItem);

        closeWindow('createProject');
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';
    } else {
        alert('프로젝트 이름을 입력해주세요.');
    }
}



function addMessage(text, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', type);
    messageElement.textContent = text;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// 초기 설정
document.addEventListener('DOMContentLoaded', (event) => {
    setInterval(updateClock, 1000);
    updateClock();

    // 데스크톱 아이콘에 클릭 이벤트 리스너 추가
    document.querySelectorAll('#Desktop .icon').forEach(icon => {
        const windowId = icon.getAttribute('data-title').replace(' ', '');
        icon.onclick = () => handleIconClick(icon, windowId);
    });

    // 메시지 입력 필드에 엔터 키 이벤트 리스너 추가
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error('Message input element not found');
    }
});