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

            repoTeamSelect.innerHTML = '<option value="">팀 선택</option>';
            editTeamSelect.innerHTML = '<option value="">팀 선택</option>';

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

            // 저장된 팀 ID가 있으면 선택
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
            } else if (folderName === 'codepen') {
                openTrash();
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