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

// 프로젝트 정보를 표시하는 함수
function showProjectInfo(projectName, projectDescription, currentUser) {
    document.getElementById("projectName").textContent = projectName;
    document.getElementById("projectDescription").textContent = projectDescription;
    document.getElementById("currentUser").textContent = `현재 사용자: ${currentUser}`;

    // 팀원 목록은 예시로 하드코딩합니다. 실제로는 서버에서 가져와야 합니다.
    const teamMembers = ["김철수", "이영희", "박민수"];
    const teamMembersList = document.getElementById("teamMembers");
    teamMembersList.innerHTML = teamMembers.map(member => `<li>${member}</li>`).join('');

    hello.style.display = "none";
    projectInfo.style.display = "block";
}

// 팀 프로젝트 리스트 페이지로 이동하는 함수
function navigateToTeamProjectList(folderName) {
    window.location.href = `/team_project_list/${folderName}`;
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', (event) => {
    const projectName = getUrlParameter('name');
    const projectDescription = getUrlParameter('description');
    const currentUser = "현재 사용자"; // 실제로는 로그인 시스템에서 가져와야 합니다.
    const folderName = getUrlParameter('folder');

    // Hello 애니메이션 표시
    hello.style.display = "flex";

    setTimeout(() => {
        showProjectInfo(projectName, projectDescription, currentUser);

        // 프로젝트 정보를 잠깐 보여준 후 팀 프로젝트 리스트 페이지로 이동
        setTimeout(() => {
            navigateToTeamProjectList(folderName);
        }, 2000); // 2초 후 이동 (필요에 따라 조정 가능)
    }, 5000); // 5초 후에 프로젝트 정보 표시 (Hello 애니메이션이 끝난 후)
});