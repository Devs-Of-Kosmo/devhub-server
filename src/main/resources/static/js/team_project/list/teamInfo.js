// teamInfo.js
window.handleTeamInfo = function() {
    const teamInfoModal = document.getElementById('teamInfoModal');
    const closeButton = teamInfoModal.querySelector('.close-button');
    const teamSelect = document.getElementById('teamSelect');
    let currentUserEmail = ''; // 현재 사용자의 이메일을 저장할 변수

    function sendAuthenticatedRequest(url, method = 'GET', body = null) {
        const token = localStorage.getItem('accessToken'); // JWT 토큰 가져오기
        const headers = {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        };

        const options = {
            method: method,
            headers: headers,
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    return Promise.reject('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                throw error;
            });
    }

    function loadTeams() {
        sendAuthenticatedRequest('/api/team/group/list', 'GET')
            .then(function(teams) {
                teamSelect.innerHTML = '<option value="">팀 선택</option>';
                teams.forEach(team => {
                    const option = document.createElement('option');
                    option.value = team.teamId;
                    option.textContent = team.teamName;
                    teamSelect.appendChild(option);
                });
                teamSelect.addEventListener('change', showSelectedTeamInfo);
                teamInfoModal.style.display = 'block';

                // 사용자 정보 로드
                return sendAuthenticatedRequest('/api/user/info', 'GET');
            })
            .then(function(userInfo) {
                currentUserEmail = userInfo.email;
                document.getElementById("currentUser").textContent = `현재 사용자: ${userInfo.name}`;
            })
            .catch(function(error) {
                console.error('Error loading teams or user info:', error);
                Swal.fire('오류', '정보를 불러오는데 실패했습니다.', 'error');
            });
    }

    function showSelectedTeamInfo() {
        const selectedTeamId = teamSelect.value;
        if (!selectedTeamId) {
            Swal.fire('알림', '팀을 선택해주세요.', 'info');
            return;
        }

        sendAuthenticatedRequest(`/api/team/group/${selectedTeamId}`, 'GET')
            .then(function(teamInfo) {
                const teamInfoContainer = document.createElement('div');
                teamInfoContainer.className = 'team-info-container';

                const currentTeamIndicator = document.createElement('div');
                currentTeamIndicator.className = 'current-team-indicator';
                currentTeamIndicator.textContent = `현재 팀: ${teamInfo.teamName}`;
                teamInfoContainer.appendChild(currentTeamIndicator);

                const projectName = document.createElement('h3');
                projectName.textContent = teamInfo.teamName;
                teamInfoContainer.appendChild(projectName);

                const projectDescription = document.createElement('p');
                projectDescription.textContent = teamInfo.description;
                teamInfoContainer.appendChild(projectDescription);

                const teamMembersList = document.createElement('ul');
                teamMembersList.id = 'teamMembers';
                teamInfo.members.forEach(member => {
                    const li = document.createElement('li');
                    li.textContent = `${member.userName} (${member.role})`;
                    if (member.email === currentUserEmail) {
                        li.classList.add('current-user');
                        li.textContent += ' (나)';
                    }
                    teamMembersList.appendChild(li);
                });
                teamInfoContainer.appendChild(teamMembersList);

                const modalBody = document.querySelector('#teamInfoModal .modal-body');
                modalBody.innerHTML = ''; // 기존 내용 제거
                modalBody.appendChild(teamSelect);
                modalBody.appendChild(teamInfoContainer);
            })
            .catch(function(error) {
                console.error('Error fetching team info:', error);
                Swal.fire('오류', '팀 정보를 불러오는데 실패했습니다.', 'error');
            });
    }

    closeButton.addEventListener('click', function() {
        teamInfoModal.style.display = 'none';
    });

    loadTeams();
};

// handleIconClick 함수 수정
window.handleIconClick = function(icon, windowId) {
    $('.disk-icon').removeClass('clicked');
    $(icon).addClass('clicked');
    setTimeout(function() {
        if (windowId === 'teamInfo') {
            window.handleTeamInfo();
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

// 페이지 로드 시 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', function() {
    const teamInfoIcon = document.querySelector('.disk-icon[data-title="teamInfo"]');
    if (teamInfoIcon) {
        teamInfoIcon.addEventListener('click', function() {
            window.handleTeamInfo();
        });
    }

    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});