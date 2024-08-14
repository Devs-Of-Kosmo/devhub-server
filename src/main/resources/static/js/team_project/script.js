// 전역 변수로 삭제된 팀 수를 추적
let deletedTeamsCount = 0;

// 시계 업데이트 함수
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `${hours}:${minutes}`;
}

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

// 아이콘 클릭 처리
function handleIconClick(icon, windowId) {
    document.querySelectorAll('#Desktop .icon').forEach(el => el.classList.remove('clicked'));
    icon.classList.add('clicked');
    setTimeout(() => {
        openWindow(windowId);
        icon.classList.remove('clicked');
    }, 300);
}

// accessToken을 가져오는 함수
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// API 요청을 보내는 함수
async function sendAuthenticatedRequest(url, method, body = null) {
    const token = getAccessToken();
    if (!token) {
        throw new Error('No access token found');
    }

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const options = {
        method: method,
        headers: headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        openWindow('loginModal');
        throw new Error('Unauthorized: Please log in again');
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
    }

    return response.json();
}

// 사용자의 팀 정보를 가져오는 함수
async function loadUserTeams() {
    try {
        const teams = await sendAuthenticatedRequest('/api/team/group/list', 'GET');
        const desktop = document.getElementById('Desktop');
        const projectList = document.getElementById('projectList');

        teams.forEach(team => {
            // 데스크톱 아이콘 생성 또는 업데이트
            let projectIcon = document.querySelector(`#Desktop .icon[data-team-id="${team.teamId}"]`);
            if (!projectIcon) {
                projectIcon = document.createElement('div');
                projectIcon.className = 'icon';
                projectIcon.setAttribute('data-team-id', team.teamId);
                desktop.appendChild(projectIcon);
            }

            projectIcon.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/3767/3767084.png" alt="${team.teamName}">
                <span class="title">${team.teamName}</span>
            `;
            projectIcon.onclick = function() {
                window.location.href = `/team_loading?id=${encodeURIComponent(team.teamId)}&name=${encodeURIComponent(team.teamName)}`;
            };

            // 프로젝트 리스트 업데이트
            let listItem = projectList.querySelector(`li[data-team-id="${team.teamId}"]`);
            if (!listItem) {
                listItem = document.createElement('li');
                listItem.setAttribute('data-team-id', team.teamId);
                projectList.appendChild(listItem);
            }
            listItem.textContent = team.teamName;
        });
    } catch (error) {
        console.error('Error loading teams:', error);
        if (error.message === 'Unauthorized: Please log in again') {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            openWindow('loginModal');
        } else {
            alert('팀 정보를 불러오는 중 오류가 발생했습니다.');
        }
    }
}

// 새 프로젝트 생성
async function createNewProject() {
    const createButton = document.getElementById('createProjectButton');
    const teamName = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;

    if (!teamName) {
        alert('팀 이름을 입력해주세요.');
        return;
    }

    createButton.disabled = true;
    createButton.textContent = '처리 중...';

    try {
        await sendAuthenticatedRequest('/api/team/group', 'POST', {
            teamName,
            description
        });

        closeWindow('createProject');
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';

        Swal.fire({
            title: '성공',
            text: '프로젝트가 성공적으로 생성되었습니다. 페이지를 새로고침합니다.',
            icon: 'success',
            confirmButtonText: '확인'
        }).then(() => {
            location.reload(); // 페이지 새로고침
        });
    } catch (error) {
        console.error('Error:', error);
        if (error.message.includes('Duplicate entry')) {
            alert('이미 존재하는 팀 이름입니다. 다른 이름을 사용해주세요.');
        } else if (error.message === 'Unauthorized: Please log in again') {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            openWindow('loginModal');
        } else {
            alert('팀 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
    } finally {
        createButton.disabled = false;
        createButton.textContent = '만들기';
    }
}
// 팀 정보 수정
async function updateTeamInfo(teamId) {
    const changedTeamName = document.getElementById('editTeamName').value.trim();
    const changedDescription = document.getElementById('editTeamDescription').value.trim();

    if (!changedTeamName && !changedDescription) {
        alert('팀 이름 또는 설명을 변경해주세요.');
        return;
    }

    const updateData = {};
    if (changedTeamName) updateData.changedTeamName = changedTeamName;
    if (changedDescription) updateData.changedDescription = changedDescription;

    try {
        await sendAuthenticatedRequest('/api/team/group', 'PATCH', {
            teamId,
            ...updateData
        });

        await loadUserTeams();

        closeWindow('editProject');
        alert('팀 정보가 성공적으로 수정되었습니다.');
    } catch (error) {
        console.error('Error:', error);
        if (error.message === 'Unauthorized: Please log in again') {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        } else {
            alert('팀 정보 수정 중 오류가 발생했습니다.');
        }
    }
}

// 드래그 앤 드롭 기능 활성화
function enableDragAndDrop() {
    const teamIcons = document.querySelectorAll('#Desktop .icon[data-team-id]');
    const trashCan = document.getElementById('trashCan');

    teamIcons.forEach(icon => {
        icon.setAttribute('draggable', 'true');
        icon.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', icon.getAttribute('data-team-id'));
        });
    });

    trashCan.addEventListener('dragover', (e) => {
        e.preventDefault();
        trashCan.classList.add('dragover');
    });

    trashCan.addEventListener('dragleave', () => {
        trashCan.classList.remove('dragover');
    });

    trashCan.addEventListener('drop', async (e) => {
        e.preventDefault();
        trashCan.classList.remove('dragover');
        const teamId = e.dataTransfer.getData('text');
        const teamName = document.querySelector(`[data-team-id="${teamId}"] .title`).textContent;

        const result = await Swal.fire({
            title: '팀 삭제',
            text: `"${teamName}" 팀을 정말로 휴지통으로 이동하시겠습니까?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '이동',
            cancelButtonText: '취소'
        });

        if (result.isConfirmed) {
            await softDeleteTeam(teamId);
        }
    });

    // 휴지통 아이콘 더블클릭 시 비우기 기능
    trashCan.addEventListener('dblclick', emptyTrash);
}

// Soft Delete API 호출
async function softDeleteTeam(teamId) {
    try {
        // API 호출 대신 로컬에서만 처리
        console.log(`Team ${teamId} moved to trash (test mode)`);

        // UI에서 팀 아이콘 제거
        const teamIcon = document.querySelector(`[data-team-id="${teamId}"]`);
        if (teamIcon) {
            teamIcon.remove();
        }

        // 프로젝트 리스트에서도 제거
        const listItem = document.querySelector(`#projectList li[data-team-id="${teamId}"]`);
        if (listItem) {
            listItem.remove();
        }

        // 삭제된 팀 수 증가 및 휴지통 이미지 업데이트
        deletedTeamsCount++;
        updateTrashCanImage();

        Swal.fire(
            '삭제 완료',
            '팀이 성공적으로 휴지통으로 이동되었습니다. (테스트 모드)',
            'success'
        );
    } catch (error) {
        console.error('Error moving team to trash:', error);
        Swal.fire(
            '오류 발생',
            '팀을 휴지통으로 이동하는 중 오류가 발생했습니다.',
            'error'
        );
    }
}

// 휴지통 이미지 업데이트
function updateTrashCanImage() {
    const trashCanImg = document.querySelector('#trashCan img');
    if (deletedTeamsCount > 0) {
        trashCanImg.src = '/css/images/team_project/fulltrash.png';
    } else {
        trashCanImg.src = '/css/images/team_project/trash.png';
    }
}

// 휴지통 비우기 함수
async function emptyTrash() {
    if (deletedTeamsCount === 0) {
        Swal.fire('휴지통이 비어있습니다', '', 'info');
        return;
    }

    const result = await Swal.fire({
        title: '휴지통 비우기',
        text: '정말로 휴지통을 비우시겠습니까? 이 작업은 되돌릴 수 없습니다.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '비우기',
        cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
        try {
            await sendAuthenticatedRequest('/api/team/group/emptyTrash', 'POST');
            deletedTeamsCount = 0;
            updateTrashCanImage();
            Swal.fire(
                '완료',
                '휴지통을 비웠습니다.',
                'success'
            );
        } catch (error) {
            console.error('Error emptying trash:', error);
            Swal.fire(
                '오류 발생',
                '휴지통을 비우는 중 오류가 발생했습니다.',
                'error'
            );
        }
    }
}

// 로그인 함수
async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/public/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);
        closeWindow('loginModal');
        location.reload();
    } catch (error) {
        console.error('Login error:', error);
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    }
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('accessToken');
    location.reload();
}

// Edit 모달에 프로젝트 목록을 채우는 함수
async function populateEditProjectModal() {
    const projectList = document.querySelectorAll('#Desktop .icon[data-team-id]');
    const selectProject = document.getElementById('selectProject');
    selectProject.innerHTML = '';

    projectList.forEach(project => {
        const teamId = project.getAttribute('data-team-id');
        const teamName = project.querySelector('.title').textContent;
        const option = document.createElement('option');
        option.value = teamId;
        option.textContent = teamName;
        selectProject.appendChild(option);
    });

    selectProject.addEventListener('change', () => {
        const selectedProject = document.querySelector(`#Desktop .icon[data-team-id="${selectProject.value}"]`);
        document.getElementById('editTeamName').value = selectedProject.querySelector('.title').textContent;
    });

    if (selectProject.options.length > 0) {
        selectProject.selectedIndex = 0;
        selectProject.dispatchEvent(new Event('change'));
    }
}

// 초기 설정
document.addEventListener('DOMContentLoaded', async (event) => {
    const token = getAccessToken();
    if (token) {
        try {
            await sendAuthenticatedRequest('/api/user/info', 'GET');
            document.getElementById('logoutButton').style.display = 'inline-block';
            setInterval(updateClock, 1000);
            updateClock();

            await loadUserTeams();
            enableDragAndDrop();  // 드래그 앤 드롭 기능 활성화

            document.querySelectorAll('#Desktop .icon').forEach(icon => {
                const windowId = icon.getAttribute('data-title');
                icon.addEventListener('click', () => handleIconClick(icon, windowId), { once: true });
            });

            const joinProjectButton = document.querySelector('#joinProject button');
            if (joinProjectButton) {
                joinProjectButton.addEventListener('click', () => closeWindow('joinProject'));
            }

            const closeListProjectsButton = document.querySelector('#listProjects button');
            if (closeListProjectsButton) {
                closeListProjectsButton.addEventListener('click', () => closeWindow('listProjects'));
            }

            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', logout);
            }

            const editMenu = document.getElementById('editMenu');
            if (editMenu) {
                editMenu.addEventListener('click', async () => {
                    await populateEditProjectModal();
                    openWindow('editProject');
                });
            }
        } catch (error) {
            console.error('Authentication error:', error);
            openWindow('loginModal');
        }
    } else {
        openWindow('loginModal');
    }

    const createProjectButton = document.getElementById('createProjectButton');
    if (createProjectButton && !createProjectButton.hasAttribute('data-listener-added')) {
        createProjectButton.addEventListener('click', createNewProject);
        createProjectButton.setAttribute('data-listener-added', 'true');
    }

    const loginButton = document.getElementById('loginButton');
    if (loginButton && !loginButton.hasAttribute('data-listener-added')) {
        loginButton.addEventListener('click', login);
        loginButton.setAttribute('data-listener-added', 'true');
    }

    const saveTeamChangesButton = document.getElementById('saveTeamChangesButton');
    if (saveTeamChangesButton && !saveTeamChangesButton.hasAttribute('data-listener-added')) {
        saveTeamChangesButton.addEventListener('click', () => {
            const selectedProjectId = document.getElementById('selectProject').value;
            updateTeamInfo(selectedProjectId);
        });
        saveTeamChangesButton.setAttribute('data-listener-added', 'true');
    }
});