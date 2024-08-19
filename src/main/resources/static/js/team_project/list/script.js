// script.js

// 전역 변수 및 상수
const MIN_WIDTH = 50;
const MAX_WIDTH = MIN_WIDTH * 2;
const STEP = (MAX_WIDTH - MIN_WIDTH) * 0.05;
let aniID = null;
const dock = document.querySelector(".dock");

// 토큰 가져오기 함수
function getToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        Swal.fire('오류', '로그인이 필요합니다.', 'error');
        window.location.href = '/login';
        return null;
    }
    return token;
}

// 사용자 정보 조회 함수
function getUserInfo(callback) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: '/api/user/info',
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function(data) {
            console.log('User info:', data);
            if (callback) callback(data);
        },
        error: function(xhr, status, error) {
            console.error('Error fetching user info:', error);
        }
    });
}

// 팀 목록 조회 함수
function loadTeams(callback) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: '/api/team/group/list',
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function(teams) {
            const repoTeamSelect = document.getElementById('repoTeamId');
            const editTeamSelect = document.getElementById('editTeamSelect');

            // 팀 목록 초기화
            repoTeamSelect.innerHTML = '<option value="">팀 선택</option>';
            editTeamSelect.innerHTML = '<option value="">팀 선택</option>';

            // 팀 목록 추가
            teams.forEach(team => {
                const optionRepo = document.createElement('option');
                optionRepo.value = team.teamId;
                optionRepo.textContent = team.teamName;
                repoTeamSelect.appendChild(optionRepo);

                const optionEdit = document.createElement('option');
                optionEdit.value = team.teamId;
                optionEdit.textContent = team.teamName;
                editTeamSelect.appendChild(optionEdit);
            });

            if (teams.length > 0 && callback) {
                callback(teams);
            }
        },
        error: function() {
            Swal.fire('오류', '팀 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

// 레포지토리 목록 조회 함수 (수정)
function loadRepositories(teamId) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: `/api/team/repo/list/${teamId}`,
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function(repos) {
            if (!repos || !Array.isArray(repos)) {
                console.error('Repos is not an array or is undefined:', repos);
                return;
            }
            console.log('Loaded repositories:', repos); // 디버깅을 위한 로그 추가
            updateDesktopIcons(repos, teamId);
            // 레포지토리 선택 섹션 활성화
            const editRepoSelect = document.getElementById('editRepoSelect');
            editRepoSelect.innerHTML = '<option value="">레포지토리 선택</option>';
            repos.forEach(function(repo) {
                const option = document.createElement('option');
                option.value = repo.projectId;
                option.textContent = repo.projectName;
                option.setAttribute('data-description', repo.description);
                option.setAttribute('data-deleted', repo.deleteCondition); // deleteCondition 정보 저장
                editRepoSelect.appendChild(option);
            });
            editRepoSelect.disabled = false;
        },
        error: function(xhr, status, error) {
            console.error('Error loading repositories:', error);
            Swal.fire('오류', '레포지토리 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

// 데스크톱 아이콘 업데이트 함수 (수정)
function updateDesktopIcons(repos, teamId) {
    const desktop = document.getElementById('desktop');
    desktop.querySelectorAll('.disk-icon:not(#create-repo-disk)').forEach(el => el.remove());

    repos.forEach(repo => {
        addRepoDiskIcon(
            repo.projectId,
            repo.projectName,
            teamId,
            document.getElementById('repoTeamId').options[document.getElementById('repoTeamId').selectedIndex].text,
            repo.description,
            repo.deleteCondition // 여기서 deleteCondition을 isDeleted 매개변수로 전달
        );
    });
}

// 레포지토리 디스크 아이콘 추가 함수 (수정)
function addRepoDiskIcon(projectId, projectName, teamId, teamName, description, isDeleted = false) {
    const desktop = document.getElementById('desktop');
    const diskIcon = document.createElement('div');
    diskIcon.className = 'disk-icon';
    diskIcon.setAttribute('data-project-id', projectId);
    diskIcon.setAttribute('draggable', 'true');
    diskIcon.innerHTML = `
        <img src="/css/images/team_project/repo.png" alt="${projectName}" style="width: 64px; height: 64px; object-fit: contain;">
        <p>${projectName}</p>
    `;

    console.log('Adding repo icon:', projectName, 'isDeleted:', isDeleted); // 디버깅을 위한 로그 추가

    if (isDeleted) {
        diskIcon.setAttribute('data-deleted', 'true');
        // CSS 클래스를 사용하여 스타일 적용
        diskIcon.classList.add('deleted-repo');
    } else {
        diskIcon.addEventListener('click', function() {
            window.location.href = `/repo/${projectId}`;
        });
        diskIcon.addEventListener('dragstart', function(event) {
            event.dataTransfer.setData('text/plain', JSON.stringify({
                id: projectId,
                name: projectName,
                teamId: teamId,
                teamName: teamName,
                description: description
            }));
        });
    }

    desktop.appendChild(diskIcon);
}

// 수정 모달 열기 함수
function openEditRepoModal() {
    loadTeams();
    $('#editRepoModal').show();
    resetEditForm();
}

// 리셋 폼 함수
function resetEditForm() {
    $('#editRepoSelect').empty().append('<option value="">레포지토리 선택</option>').prop('disabled', true);
    $('#editProjectName, #editDescription').val('').prop('disabled', true);
    $('#editRepoButton, #deleteRepoButton').prop('disabled', true);
}

// 도크 애니메이션 함수
const updateWidth = function (nextWidths) {
    window.cancelAnimationFrame(aniID);
    aniID = null;

    let isAllDone = true;
    let newWidth = 0;
    const items = document.querySelectorAll(".item");
    for (let i = 0; i < items.length; i++) {
        const currWidth = items[i].getBoundingClientRect().width;
        const goalWidth = nextWidths[i];
        if (goalWidth < currWidth) {
            newWidth = Math.max(currWidth - STEP, goalWidth);
            isAllDone = false;
        } else if (goalWidth > currWidth) {
            newWidth = Math.min(currWidth + STEP, goalWidth);
            isAllDone = false;
        } else {
            newWidth = goalWidth;
        }
        items[i].style.width = newWidth + "px";
    }

    if (!isAllDone) {
        aniID = window.requestAnimationFrame(() => {
            updateWidth(nextWidths);
        });
    }
};

// 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    // 도크 아이템 클릭 이벤트 처리
    document.querySelectorAll(".dock .item").forEach(item => {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            const folderName = item.getAttribute("data-folder");

            if (folderName === 'settings') {
                loadRepositoriesForEdit();
                document.getElementById('editRepoModal').style.display = "block";
            } else if (folderName === 'codepen') {
                openTrash(); // openTrash 함수는 delete_repo.js에 정의되어 있음
            } else if (folderName === 'google' || folderName === 'git' || folderName === 'postman') {
                let url;
                switch (folderName) {
                    case 'google':
                        url = 'https://www.google.com';
                        break;
                    case 'git':
                        url = 'https://github.com';
                        break;
                    case 'postman':
                        url = 'https://www.postman.com';
                        break;
                }
                window.open(url, '_blank');
            }
        });
    });

    // 삭제 버튼 이벤트 리스너 수정
    document.getElementById('deleteRepoButton').addEventListener('click', function() {
        const projectId = document.getElementById('editRepoSelect').value;
        if (projectId) {
            moveToTrash({
                id: projectId,
                name: document.getElementById('editProjectName').value,
                teamId: document.getElementById('repoTeamId').value,
                teamName: document.getElementById('repoTeamId').options[document.getElementById('repoTeamId').selectedIndex].text,
                description: document.getElementById('editDescription').value
            });
            document.getElementById('editRepoModal').style.display = "none";
            // 레포지토리 목록 새로고침
            loadRepositories(document.getElementById('repoTeamId').value);
        } else {
            Swal.fire('오류', '삭제할 레포지토리를 선택해주세요.', 'error');
        }
    });

    // 도크 마우스 이벤트
    dock.addEventListener("mousemove", function (e) {
        const dockTop = e.target.getBoundingClientRect().top;
        const y = e.clientY - dockTop;

        const nextWidths = [];
        const items = document.querySelectorAll(".item");
        for (const item of items) {
            const rect = item.getBoundingClientRect();
            const center = rect.top - dockTop + rect.height / 2;

            const dist = Math.abs(center - y);
            nextWidths.push(Math.max(MAX_WIDTH - dist / 4, MIN_WIDTH));
        }
        updateWidth(nextWidths);
    });


    // 설정 버튼 클릭 이벤트
    document.querySelector('[data-folder="settings"]').addEventListener('click', function(event) {
        event.preventDefault();
        // edit_repo.js에 정의된 함수 호출
        openEditRepoModal();
    });

    // 팀 선택 변경 이벤트 추가
    document.getElementById('repoTeamId').addEventListener('change', function() {
        const teamId = this.value;
        if (teamId) {
            loadRepositories(teamId);
        }
    });

    dock.addEventListener("mouseleave", function () {
        const items = document.querySelectorAll(".item");
        const nextWidths = [];
        for (const item of items) {
            nextWidths.push(MIN_WIDTH);
        }
        updateWidth(nextWidths);
    });

    // 모달 관련 이벤트 리스너
    document.getElementById('create-repo-disk').onclick = function() {
        loadTeams();
        document.getElementById('createRepoModal').style.display = "block";
    }

    document.querySelectorAll('.close-button').forEach(button => {
        button.onclick = function() {
            this.closest('.modal').style.display = "none";
        }
    });

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }

    // 초기화
    getUserInfo();
    const token = getToken();
    if (token) {
        loadTeams();
    }
    initializeTrash();  // 휴지통 초기화 함수 호출 (delete_repo.js에 정의)
});