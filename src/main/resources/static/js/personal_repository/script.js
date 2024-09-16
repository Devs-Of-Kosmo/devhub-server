document.addEventListener('DOMContentLoaded', function () {
    var accessToken = localStorage.getItem('accessToken');
    var projectId = sessionStorage.getItem('projectId'); // 세션 스토리지에서 projectId 가져오기

    // AccessToken이 없을 경우, 로그인 페이지로 이동
    if (!accessToken) {
        console.error('Access token is missing.');
        window.location.href = '/login'; // 로그인 페이지로 리디렉션
        return;
    }

    // projectId가 없는 경우 에러 출력
    if (!projectId) {
        console.error('Project ID is missing in session storage.');
        return;
    }

    // 사용자 정보를 가져와서 네비게이션 바에 표시하는 함수 호출
    fetchUserInfo(accessToken);

    // 프로젝트 목록을 가져오고 필터링
    fetch('/api/personal/repo/list', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access - please log in again');
            } else if (response.status === 404) {
                throw new Error('API endpoint not found');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Personal projects:', data);

        // 세션 스토리지에 저장된 projectId에 맞는 프로젝트만 필터링
        const project = data.find(p => p.projectId === Number(projectId)); // projectId 비교할 때 숫자형으로 변환
        if (project) {
            displayProjectDetails(project);
        } else {
            console.error(`No project found with ID: ${projectId}`);
        }
    })
    .catch(error => console.error('Error fetching project data:', error));

    // 프로젝트 생성
    var createProjectForm = document.getElementById('create-project-form');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var projectName = document.getElementById('projectName').value;
            var description = document.getElementById('description').value;

            if (accessToken && projectName && description) {
                fetch('/api/personal/repo', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectName: projectName,
                        description: description
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error creating project');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Project creation response:', data);
                    if (data.personalProjectId) {
                        window.location.reload();
                    } else {
                        console.error('Project creation failed:', data);
                    }
                })
                .catch(error => console.error('Error creating project:', error));
            } else {
                console.error('Missing access token or project details.');
            }
        });
    }
});

// 사용자 정보 가져오기
function fetchUserInfo(accessToken) {
    fetch('/api/user/info', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Accept': '*/*'
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized access - please log in again');
            } else if (response.status === 404) {
                throw new Error('API endpoint not found');
            }
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('User info:', data);
        const loginNavItem = document.getElementById('login-nav-item');
        const loginLink = document.getElementById('login-link');

        if (loginLink) {
            loginLink.textContent = `${data.name}님의 `;
        }
    })
    .catch(error => console.error('Error fetching user info:', error));
}

// 프로젝트 데이터를 UI에 표시하는 함수
function displayProjectDetails(project) {
    const projectNameElement = document.getElementById('project-name');
    const projectDescriptionElement = document.getElementById('project-description');
    const projectCreatedDateElement = document.getElementById('project-created-date');

    if (projectNameElement && projectDescriptionElement && projectCreatedDateElement) {
        projectNameElement.textContent = project.projectName;
        projectDescriptionElement.textContent = project.description;
        projectCreatedDateElement.textContent = new Date(project.createdDate).toLocaleString();
    }
}

// Resizable divider handling
document.querySelectorAll('.resizable-divider').forEach(divider => {
    divider.addEventListener('mousedown', function(e) {
        e.preventDefault();

        document.addEventListener('mousemove', resize, false);
        document.addEventListener('mouseup', stopResize, false);

        function resize(e) {
            const prevSibling = divider.previousElementSibling;
            const nextSibling = divider.nextElementSibling;

            const prevWidth = prevSibling.offsetWidth;
            const nextWidth = nextSibling.offsetWidth;

            const totalWidth = prevWidth + nextWidth;

            const newPrevWidth = Math.max(0, Math.min(totalWidth - 20, prevWidth + e.movementX));
            const newNextWidth = totalWidth - newPrevWidth;

            prevSibling.style.width = `${(newPrevWidth / totalWidth) * 100}%`;
            nextSibling.style.width = `${(newNextWidth / totalWidth) * 100}%`;
        }

        function stopResize() {
            document.removeEventListener('mousemove', resize, false);
            document.removeEventListener('mouseup', stopResize, false);
        }
    });
});
