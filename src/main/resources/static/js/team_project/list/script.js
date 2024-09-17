// script.js
const MIN_WIDTH = 50;
const MAX_WIDTH = MIN_WIDTH * 2;
const STEP = (MAX_WIDTH - MIN_WIDTH) * 0.05;
let aniID = null;
const dock = document.querySelector(".dock");
let currentTeamId = localStorage.getItem('selectedTeamId') || null;

function getToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        Swal.fire('오류', '로그인이 필요합니다.', 'error');
        window.location.href = '/login';
        return null;
    }
    return token;
}

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
            const leaveTeamSelect = document.getElementById('leaveTeamSelect');

            repoTeamSelect.innerHTML = '<option value="">팀 선택</option>';
            editTeamSelect.innerHTML = '<option value="">팀 선택</option>';
            leaveTeamSelect.innerHTML = '<option value="">팀 선택</option>';

            teams.forEach(team => {
                const optionRepo = document.createElement('option');
                optionRepo.value = team.teamId;
                optionRepo.textContent = team.teamName;
                repoTeamSelect.appendChild(optionRepo);

                const optionEdit = document.createElement('option');
                optionEdit.value = team.teamId;
                optionEdit.textContent = team.teamName;
                editTeamSelect.appendChild(optionEdit);

                const optionLeave = document.createElement('option');
                optionLeave.value = team.teamId;
                optionLeave.textContent = team.teamName;
                leaveTeamSelect.appendChild(optionLeave);
            });

            if (currentTeamId) {
                repoTeamSelect.value = currentTeamId;
                editTeamSelect.value = currentTeamId;
            } else if (teams.length > 0) {
                currentTeamId = teams[0].teamId;
                repoTeamSelect.value = currentTeamId;
                editTeamSelect.value = currentTeamId;
            }

            if (currentTeamId) {
                loadRepositories(currentTeamId);
            }

            if (callback) {
                callback(teams);
            }
        },
        error: function() {
            Swal.fire('오류', '팀 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

window.loadTeams = loadTeams;

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
            console.log('Loaded repositories for team', teamId, ':', repos);
            updateDesktopIcons(repos, teamId);
            updateEditRepoSelect(repos);
        },
        error: function(xhr, status, error) {
            console.error('Error loading repositories:', error);
            Swal.fire('오류', '레포지토리 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

function updateDesktopIcons(repos, teamId) {
    const desktop = document.getElementById('desktop');

    desktop.querySelectorAll('.disk-icon:not(#create-repo-disk):not([data-title="teamInfo"]):not([data-title="inviteMembers"])').forEach(el => el.remove());

    repos.forEach(repo => {
        addRepoDiskIcon(
            repo.projectId,
            repo.projectName,
            teamId,
            document.getElementById('repoTeamId').options[document.getElementById('repoTeamId').selectedIndex].text,
            repo.description,
            repo.deleteCondition
        );
    });

    if (!desktop.querySelector('[data-title="teamInfo"]')) {
        addTeamInfoIcon();
    }
    if (!desktop.querySelector('[data-title="inviteMembers"]')) {
        addInviteMembersIcon();
    }
}

function addTeamInfoIcon() {
    const desktop = document.getElementById('desktop');
    if (!desktop.querySelector('[data-title="teamInfo"]')) {
        const teamInfoIcon = document.createElement('div');
        teamInfoIcon.className = 'disk-icon';
        teamInfoIcon.setAttribute('data-title', 'teamInfo');
        teamInfoIcon.innerHTML = `
            <img src="/css/images/team_project/team_info.png" alt="팀 정보">
            <p>팀 정보</p>
        `;
        teamInfoIcon.onclick = function() { handleIconClick(this, 'teamInfo'); };
        desktop.appendChild(teamInfoIcon);
    }
}

function addInviteMembersIcon() {
    const desktop = document.getElementById('desktop');
    if (!desktop.querySelector('[data-title="inviteMembers"]')) {
        const inviteMembersIcon = document.createElement('div');
        inviteMembersIcon.className = 'disk-icon';
        inviteMembersIcon.setAttribute('data-title', 'inviteMembers');
        inviteMembersIcon.innerHTML = `
            <img src="/css/images/team_project/invite.png" alt="팀원 초대">
            <p>팀원 초대</p>
        `;
        inviteMembersIcon.onclick = function() { handleIconClick(this, 'inviteMembers'); };
        desktop.appendChild(inviteMembersIcon);
    }
}

function updateEditRepoSelect(repos) {
    const editRepoSelect = document.getElementById('editRepoSelect');
    editRepoSelect.innerHTML = '<option value="">레포지토리 선택</option>';
    repos.forEach(function(repo) {
        const option = document.createElement('option');
        option.value = repo.projectId;
        option.textContent = repo.projectName;
        option.setAttribute('data-description', repo.description);
        option.setAttribute('data-deleted', repo.deleteCondition);
        editRepoSelect.appendChild(option);
    });
    editRepoSelect.disabled = false;
}

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

    console.log('Adding repo icon:', projectName, 'isDeleted:', isDeleted);

    if (isDeleted) {
        diskIcon.setAttribute('data-deleted', 'true');
        diskIcon.classList.add('deleted-repo');
    } else {
        diskIcon.addEventListener('click', function() {
            window.location.href = `/test_team`;
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

function openEditRepoModal() {
    loadTeams();
    $('#editRepoModal').show();
    resetEditForm();
}

function resetEditForm() {
    $('#editRepoSelect').empty().append('<option value="">레포지토리 선택</option>').prop('disabled', true);
    $('#editProjectName, #editDescription').val('').prop('disabled', true);
    $('#editRepoButton, #deleteRepoButton').prop('disabled', true);
}

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

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll(".dock .item").forEach(item => {
        item.addEventListener("click", function (event) {
            event.preventDefault();
            const folderName = item.getAttribute("data-folder");

            if (folderName === 'settings') {
                openEditRepoModal();
            } else if (folderName === 'google') {
                window.open('https://www.google.com', '_blank');
            }
        });
    });

    // 팀 나가기 버튼에 대한 이벤트 리스너 추가
    const leaveTeamButton = document.querySelector('.item[data-folder="leaveTeam"]');
    if (leaveTeamButton) {
        leaveTeamButton.addEventListener('click', function(event) {
            event.preventDefault();
            console.log('Leave team button clicked');
            if (typeof window.showLeaveTeamModal === 'function') {
                window.showLeaveTeamModal();
            } else {
                console.error('showLeaveTeamModal function is not defined');
            }
        });
    } else {
        console.error('Leave team button not found');
    }

    document.getElementById('deleteRepoButton').addEventListener('click', function() {
        const projectId = document.getElementById('editRepoSelect').value;
        if (projectId) {
            moveToTrash({
                id: projectId,
                name: document.getElementById('editProjectName').value,
                teamId: document.getElementById('editTeamSelect').value,
                teamName: document.getElementById('editTeamSelect').options[document.getElementById('editTeamSelect').selectedIndex].text,
                description: document.getElementById('editDescription').value
            });
            document.getElementById('editRepoModal').style.display = "none";
            loadRepositories(document.getElementById('editTeamSelect').value);
        } else {
            Swal.fire('오류', '삭제할 레포지토리를 선택해주세요.', 'error');
        }
    });

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

    dock.addEventListener("mouseleave", function () {
        const items = document.querySelectorAll(".item");
        const nextWidths = [];
        for (const item of items) {
            nextWidths.push(MIN_WIDTH);
        }
        updateWidth(nextWidths);
    });

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

    document.getElementById('repoTeamId').addEventListener('change', function() {
        const teamId = this.value;
        if (teamId) {
            currentTeamId = teamId;
            localStorage.setItem('selectedTeamId', currentTeamId);
            loadRepositories(teamId);
        } else {
            const desktop = document.getElementById('desktop');
            desktop.querySelectorAll('.disk-icon:not(#create-repo-disk):not([data-title="teamInfo"]):not([data-title="inviteMembers"])').forEach(el => el.remove());
        }
    });

    getUserInfo();
    const token = getToken();
    if (token) {
        loadTeams(function(teams) {
            if (currentTeamId) {
                loadRepositories(currentTeamId);
            } else if (teams.length > 0) {
                currentTeamId = teams[0].teamId;
                document.getElementById('repoTeamId').value = currentTeamId;
                loadRepositories(currentTeamId);
            }
        });
    }

    addTeamInfoIcon();
    addInviteMembersIcon();

    initializeTrash();
});

window.handleIconClick = function(icon, windowId) {
    $('.disk-icon').removeClass('clicked');
    $(icon).addClass('clicked');
    setTimeout(function() {
        if (windowId === 'teamInfo') {
            window.handleTeamInfo();
        } else if (windowId === 'inviteMembers') {
            $('#inviteMembersModal').show();
            getCurrentTeamInfo();
        } else if (windowId === 'editTeam') {
            window.populateEditProjectModal().then(function() {
                $('#editRepoModal').show();
            });
        } else if (windowId === 'leaveTeam') {
            console.log('Attempting to show leave team modal');
            if (typeof window.showLeaveTeamModal === 'function') {
                window.showLeaveTeamModal();
            } else {
                console.error('showLeaveTeamModal function is not defined');
            }
        } else {
            $(`#${windowId}Modal`).show();
        }
        $(icon).removeClass('clicked');
    }, 300);
};

function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: '확인'
    });
}

// 휴지통 관련 함수들
function initializeTrash() {
    const trashCan = document.querySelector('.trash-can');
    trashCan.addEventListener('dragover', allowDrop);
    trashCan.addEventListener('drop', drop);
}

function allowDrop(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const data = JSON.parse(event.dataTransfer.getData('text'));
    moveToTrash(data);
}

function moveToTrash(repoData) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: `/api/team/repo/delete/${repoData.id}`,
        type: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function() {
            showAlert('성공', '레포지토리가 휴지통으로 이동되었습니다.', 'success');
            loadRepositories(repoData.teamId);
        },
        error: function(xhr, status, error) {
            console.error('Error moving repository to trash:', error);
            showAlert('오류', '레포지토리를 휴지통으로 이동하는데 실패했습니다.', 'error');
        }
    });
}

function openTrash() {
    loadDeletedRepos();
    $('#trashModal').show();
}

function loadDeletedRepos() {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: '/api/team/repo/deleted',
        type: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function(deletedRepos) {
            updateTrashItems(deletedRepos);
        },
        error: function(xhr, status, error) {
            console.error('Error loading deleted repositories:', error);
            showAlert('오류', '삭제된 레포지토리 목록을 불러오는데 실패했습니다.', 'error');
        }
    });
}

function updateTrashItems(deletedRepos) {
    const trashItems = document.getElementById('trashItems');
    trashItems.innerHTML = '';

    deletedRepos.forEach(repo => {
        const item = document.createElement('div');
        item.className = 'trash-item';
        item.innerHTML = `
            <span>${repo.projectName}</span>
            <button onclick="restoreRepo(${repo.projectId})">복구</button>
            <button onclick="permanentlyDeleteRepo(${repo.projectId})">영구 삭제</button>
        `;
        trashItems.appendChild(item);
    });
}

function restoreRepo(projectId) {
    const token = getToken();
    if (!token) return;

    $.ajax({
        url: `/api/team/repo/restore/${projectId}`,
        type: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function() {
            showAlert('성공', '레포지토리가 복구되었습니다.', 'success');
            loadDeletedRepos();
            loadRepositories(currentTeamId);
        },
        error: function(xhr, status, error) {
            console.error('Error restoring repository:', error);
            showAlert('오류', '레포지토리 복구에 실패했습니다.', 'error');
        }
    });
}

function permanentlyDeleteRepo(projectId) {
    const token = getToken();
    if (!token) return;

    Swal.fire({
        title: '경고',
        text: "이 작업은 되돌릴 수 없습니다. 정말로 이 레포지토리를 영구적으로 삭제하시겠습니까?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `/api/team/repo/permanentDelete/${projectId}`,
                type: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                success: function() {
                    showAlert('성공', '레포지토리가 영구적으로 삭제되었습니다.', 'success');
                    loadDeletedRepos();
                },
                error: function(xhr, status, error) {
                    console.error('Error permanently deleting repository:', error);
                    showAlert('오류', '레포지토리 영구 삭제에 실패했습니다.', 'error');
                }
            });
        }
    });
}