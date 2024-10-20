// teamInfo.js

// 1. 인증된 요청을 보내는 함수 (글로벌 스코프)
window.sendAuthenticatedRequest = function(url, method = 'GET', body = null) {
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
                // 에러 응답 본문이 있을 수 있으므로 텍스트로 읽어서 반환
                return response.text().then(text => {
                    return Promise.reject(text || 'Network response was not ok');
                });
            }

            // 응답 본문의 길이를 확인하여 본문이 없는 경우 처리
            const contentLength = response.headers.get('content-length');
            if (response.status === 204 || (contentLength && parseInt(contentLength) === 0)) {
                return null; // 본문이 없으므로 null 반환
            }

            // JSON 응답 처리
            return response.json().catch(err => {
                // JSON 파싱 에러 발생 시 텍스트로 반환
                return response.text().then(text => text || null);
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            throw error;
        });
}

// 2. 액션 버튼 생성 함수 (글로벌 스코프)
window.createActionButtons = function(container, teamId, member, includeKick = true) {
    console.log("Creating action buttons for member:", member.userName);

    const promoteButton = document.createElement('button');
    promoteButton.textContent = '진급';
    promoteButton.classList.add('action-button', 'promote-button');
    promoteButton.setAttribute('data-team-id', teamId);
    promoteButton.setAttribute('data-member-id', member.userId);
    container.appendChild(promoteButton);

    const relegateButton = document.createElement('button');
    relegateButton.textContent = '강등';
    relegateButton.classList.add('action-button', 'relegate-button');
    relegateButton.setAttribute('data-team-id', teamId);
    relegateButton.setAttribute('data-member-id', member.userId);
    container.appendChild(relegateButton);

    if (includeKick) {
        const kickButton = document.createElement('button');
        kickButton.textContent = '퇴출';
        kickButton.classList.add('action-button', 'kick-button');
        kickButton.setAttribute('data-team-id', teamId);
        kickButton.setAttribute('data-member-id', member.userId);
        container.appendChild(kickButton);
    }
}

// 3. 팀 멤버의 역할을 가져오는 함수 (글로벌 스코프)
window.getMemberRole = function(memberId) {
    const member = window.teamMembers.find(m => String(m.userId) === String(memberId));
    return member ? member.role.toLowerCase() : null; // 소문자로 반환
}

// 4. 팀 정보를 새로고침하는 함수 (글로벌 스코프)
window.refreshTeamInfo = function(teamId) {
    console.log("Refreshing team info for Team ID:", teamId);

    sendAuthenticatedRequest(`/api/team/group/${teamId}`, 'GET')
        .then(function(teamInfo) {
            console.log("Team info received:", teamInfo);

            // teamInfo의 유효성 검사
            if (!teamInfo) {
                throw new Error('팀 정보를 받아오지 못했습니다.');
            }

            // members 배열의 유효성 검사
            if (!teamInfo.members || !Array.isArray(teamInfo.members)) {
                throw new Error('멤버 데이터가 올바른 형식이 아닙니다.');
            }

            // 팀 멤버 목록 업데이트
            window.teamMembers = teamInfo.members;

            // 현재 사용자의 역할 업데이트 (소문자로 변환)
            window.currentUserRole = ''; // 초기화
            teamInfo.members.forEach(member => {
                if (String(member.userId) === String(window.currentUserId)) {
                    window.currentUserRole = member.role.toLowerCase();
                }
            });

            console.log('Current User Role:', window.currentUserRole);

            // 팀 정보 UI 업데이트
            // 팀 이름과 설명 업데이트
            const teamNameElement = document.querySelector('#teamInfoModal h3');
            if (teamNameElement) {
                teamNameElement.textContent = teamInfo.teamName;
            }

            const teamDescriptionElement = document.querySelector('#teamInfoModal p');
            if (teamDescriptionElement) {
                teamDescriptionElement.textContent = teamInfo.description;
            }

            // 팀 멤버 목록 업데이트
            const teamMembersList = document.getElementById('teamMembers');
            if (!teamMembersList) {
                throw new Error('팀 멤버 목록 요소를 찾을 수 없습니다.');
            }

            teamMembersList.innerHTML = ''; // 기존 멤버 목록 제거

            // 팀 멤버 표시
            teamInfo.members.forEach(member => {
                const li = document.createElement('li');

                const memberInfo = document.createElement('div');
                memberInfo.className = 'member-info';
                memberInfo.textContent = `${member.userName} (${member.role})`;
                li.appendChild(memberInfo);

                const memberActions = document.createElement('div');
                memberActions.className = 'member-actions';

                // 권한에 따른 버튼 생성
                if (window.currentUserRole === 'manager') {
                    // 매니저는 모든 작업 가능
                    if (String(member.userId) !== String(window.currentUserId)) { // 자기 자신 제외
                        console.log("Creating buttons for manager role for member:", member.userName);
                        createActionButtons(memberActions, teamId, member);
                    }
                } else if (window.currentUserRole === 'sub_manager') {
                    // 서브 매니저는 멤버에 대한 진급/강등만 가능
                    if (member.role.toLowerCase() === 'member' && String(member.userId) !== String(window.currentUserId)) {
                        console.log("Creating buttons for sub_manager role for member:", member.userName);
                        createActionButtons(memberActions, teamId, member, false); // kick 버튼 제외
                    }
                }
                // 멤버는 아무 작업도 수행할 수 없음

                li.appendChild(memberActions);
                teamMembersList.appendChild(li);
            });

            // 버튼 이벤트 다시 설정
            console.log("Re-initializing button events");
            initPromotionButtons();
            initRelegationButtons();
            initKickButtons();
        })
        .catch(function(error) {
            console.error('Error refreshing team info:', error);
            Swal.fire('오류', `팀 정보를 새로고침하는 데 실패했습니다: ${error.message}`, 'error');
        });
}

// 5. 팀 정보를 표시하는 함수 (글로벌 스코프)
window.handleTeamInfo = function() {
    const teamInfoModal = document.getElementById('teamInfoModal');
    const closeButton = teamInfoModal.querySelector('.close-button');
    const teamSelect = document.getElementById('teamSelect');

    // 전역 변수로 선언
    window.currentUserEmail = '';
    window.currentUserId = '';
    window.currentUserRole = '';
    window.teamMembers = [];

    // 팀 목록과 사용자 정보를 로드하는 함수
    window.loadTeams = function() {
        // 사용자 정보 먼저 로드
        sendAuthenticatedRequest('/api/user/info', 'GET')
            .then(function(userInfo) {
                window.currentUserEmail = userInfo.email;
                window.currentUserId = userInfo.userId; // 사용자 ID 저장
                window.currentUserRole = userInfo.role ? userInfo.role.toLowerCase() : ''; // 사용자 역할 저장 (서버에서 role을 반환한다고 가정)

                console.log("User Info Loaded:");
                console.log("Email:", window.currentUserEmail);
                console.log("User ID:", window.currentUserId);
                console.log("User Role:", window.currentUserRole);

                // 팀 목록 로드
                return sendAuthenticatedRequest('/api/team/group/list', 'GET');
            })
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
            })
            .catch(function(error) {
                console.error('Error loading user info or teams:', error);
                Swal.fire('오류', '정보를 불러오는데 실패했습니다.', 'error');
            });
    }

    // 선택된 팀의 정보를 표시하는 함수
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

                window.teamMembers = teamInfo.members; // 팀 멤버 목록 저장

                // 현재 사용자의 역할 확인 (소문자로 변환)
                window.currentUserRole = ''; // 초기화
                teamInfo.members.forEach(member => {
                    if (String(member.userId) === String(window.currentUserId)) {
                        window.currentUserRole = member.role.toLowerCase();
                    }
                });

                console.log('Current User Role:', window.currentUserRole);

                // 팀 멤버 표시
                teamInfo.members.forEach(member => {
                    const li = document.createElement('li');

                    const memberInfo = document.createElement('div');
                    memberInfo.className = 'member-info';
                    memberInfo.textContent = `${member.userName} (${member.role})`;
                    li.appendChild(memberInfo);

                    const memberActions = document.createElement('div');
                    memberActions.className = 'member-actions';

                    // 권한에 따른 버튼 생성
                    if (window.currentUserRole === 'manager') {
                        // 매니저는 모든 작업 가능
                        if (String(member.userId) !== String(window.currentUserId)) { // 자기 자신 제외
                            console.log("Creating buttons for manager role for member:", member.userName);
                            createActionButtons(memberActions, selectedTeamId, member);
                        }
                    } else if (window.currentUserRole === 'sub_manager') {
                        // 서브 매니저는 멤버에 대한 진급/강등만 가능
                        if (member.role.toLowerCase() === 'member' && String(member.userId) !== String(window.currentUserId)) {
                            console.log("Creating buttons for sub_manager role for member:", member.userName);
                            createActionButtons(memberActions, selectedTeamId, member, false); // kick 버튼 제외
                        }
                    }
                    // 멤버는 아무 작업도 수행할 수 없음

                    li.appendChild(memberActions);
                    teamMembersList.appendChild(li);
                });

                teamInfoContainer.appendChild(teamMembersList);

                const modalBody = document.querySelector('#teamInfoModal .modal-body');
                modalBody.innerHTML = ''; // 기존 내용 제거
                modalBody.appendChild(teamSelect);
                modalBody.appendChild(teamInfoContainer);

                // 버튼 이벤트 핸들러 설정
                console.log("Re-initializing button events");
                initPromotionButtons();
                initRelegationButtons();
                initKickButtons();
            })
            .catch(function(error) {
                console.error('Error fetching team info:', error);
                Swal.fire('오류', '팀 정보를 불러오는데 실패했습니다.', 'error');
            });
    }

    // 모달 닫기 버튼 이벤트
    closeButton.addEventListener('click', function() {
        teamInfoModal.style.display = 'none';
    });

    // 팀 목록과 사용자 정보 로드
    loadTeams();
};

// 6. 아이콘 클릭 핸들러 수정 (글로벌 스코프)
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

// 7. 페이지 로드 시 이벤트 리스너 설정 (글로벌 스코프)
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
