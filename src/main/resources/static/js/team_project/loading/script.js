const hello = document.querySelector(".hello__div");
const projectInfo = document.querySelector(".project__info");

function toggleHello() {
    hello.style.display = hello.style.display === "none" ? "flex" : "none";
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

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

function navigateToTeamProjectList(teamId) {
    window.location.href = `/team_project_list/${teamId}`;
}

document.addEventListener('DOMContentLoaded', async (event) => {
    const teamId = getUrlParameter('id');

    hello.style.display = "flex";

    setTimeout(async () => {
        await showProjectInfo(teamId);

        setTimeout(() => {
            navigateToTeamProjectList(teamId);
        }, 3000);
    }, 5000);
});