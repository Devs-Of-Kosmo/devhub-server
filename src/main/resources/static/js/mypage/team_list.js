// JWT 토큰을 가져오는 함수
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// 인증된 요청을 보내는 함수
async function sendAuthenticatedRequest(url, method = 'GET') {
    const token = getAccessToken();
    if (!token) {
        throw new Error('인증 토큰이 없습니다. 다시 로그인해주세요.');
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.status === 401) {
        throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!response.ok) {
        throw new Error(`요청 실패: ${response.status}`);
    }

    return response.json();
}

// 팀 목록을 가져오는 함수
async function fetchTeamList() {
    try {
        return await sendAuthenticatedRequest('/api/team/group/list');
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// 팀 상세 정보를 가져오는 함수
async function fetchTeamDetails(teamId) {
    try {
        return await sendAuthenticatedRequest(`/api/team/group/${teamId}`);
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}async function displayTeamList() {
    try {
        const teams = await fetchTeamList();
        const settingsTab = document.getElementById('settings');
        settingsTab.innerHTML = '<h3>나의 팀 목록</h3><div class="team-list-container"></div>';
        const teamListContainer = settingsTab.querySelector('.team-list-container');

        for (const team of teams) {
            const teamDetails = await fetchTeamDetails(team.teamId);
            const teamElement = document.createElement('div');
            teamElement.className = 'team-item';
            teamElement.innerHTML = `
                <h4>${teamDetails.teamName}</h4>
                <p><strong>설명:</strong> ${teamDetails.description || '설명 없음'}</p>
                <p><strong>생성일:</strong> ${new Date(teamDetails.createdDate).toLocaleDateString()}</p>
                <p><strong>멤버 수:</strong> ${teamDetails.members.length}</p>
                <div class="team-members">
                    <h5>팀원 목록:</h5>
                    <ul>
                        ${teamDetails.members.map(member => `
                            <li>${member.userName} (${member.email}) - ${member.role}</li>
                        `).join('')}
                    </ul>
                </div>
            `;
            teamListContainer.appendChild(teamElement);
        }
    } catch (error) {
        console.error('팀 목록을 표시하는데 실패했습니다:', error);
        Swal.fire('오류', error.message, 'error');
    }
}
// 페이지 로드 시 이벤트 리스너 추가
document.addEventListener('DOMContentLoaded', () => {
    const teamProjectLink = document.getElementById('team-project-link');
    if (teamProjectLink) {
        teamProjectLink.addEventListener('click', () => {
            const settingsTab = document.querySelector('a[href="#settings"]');
            if (settingsTab) {
                settingsTab.click();
            }
            displayTeamList();
        });
    }

    const settingsTabLink = document.querySelector('a[href="#settings"]');
    if (settingsTabLink) {
        settingsTabLink.addEventListener('click', displayTeamList);
    }
});