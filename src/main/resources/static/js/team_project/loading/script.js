const hello = document.querySelector(".hello__div");
const projectInfo = document.querySelector(".project__info");

function toggleHello() {
    hello.style.display = hello.style.display === "none" ? "flex" : "none";
}

// URL에서 파라미터를 가져오는 함수
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// API 요청을 보내는 함수
async function sendAuthenticatedRequest(url, method = 'GET') {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        throw new Error('No access token found');
    }

    const response = await fetch(url, {
        method: method,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

// 프로젝트 정보를 표시하는 함수
async function showProjectInfo(teamId) {
    try {
        const userInfo = await sendAuthenticatedRequest('/api/user/info');
        const teamInfo = await sendAuthenticatedRequest(`/api/team/group/${teamId}`);

        document.getElementById("projectName").textContent = teamInfo.teamName;
        document.getElementById("projectDescription").textContent = teamInfo.description;
        document.getElementById("currentUser").textContent = `현재 사용자: ${userInfo.name}`;

        const teamMembersList = document.getElementById("teamMembers");
        teamMembersList.innerHTML = teamInfo.members.map(member => `<li>${member.userName} (${member.role})</li>`).join('');

        hello.style.display = "none";
        projectInfo.style.display = "block";
    } catch (error) {
        console.error('Error fetching project info:', error);
        alert('프로젝트 정보를 불러오는 데 실패했습니다.');
    }
}

// 팀 프로젝트 리스트 페이지로 이동하는 함수
async function navigateToTeamProjectList() {
    try {
        const teamList = await sendAuthenticatedRequest('/api/team/group/list');
        // 여기서는 첫 번째 팀으로 이동하도록 설정했습니다. 필요에 따라 수정 가능합니다.
        if (teamList.length > 0) {
            window.location.href = `/team_project_list/${teamList[0].teamId}`;
        } else {
            alert('소속된 팀이 없습니다.');
        }
    } catch (error) {
        console.error('Error fetching team list:', error);
        alert('팀 목록을 불러오는 데 실패했습니다.');
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async (event) => {
    const teamId = getUrlParameter('id');

    // Hello 애니메이션 표시
    hello.style.display = "flex";

    setTimeout(async () => {
        await showProjectInfo(teamId);

        // 프로젝트 정보를 잠깐 보여준 후 팀 프로젝트 리스트 페이지로 이동
        setTimeout(() => {
            navigateToTeamProjectList();
        }, 3000); // 2초 후 이동 (필요에 따라 조정 가능)
    }, 5000); // 5초 후에 프로젝트 정보 표시 (Hello 애니메이션이 끝난 후)
});