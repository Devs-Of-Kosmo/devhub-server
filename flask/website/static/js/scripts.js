document.addEventListener('DOMContentLoaded', function () {
    var urlParams = new URLSearchParams(window.location.search);
    var token = urlParams.get('token');
    var projectName = urlParams.get('projectName'); // projectId 대신 projectName을 URL에서 가져옵니다.

    // token을 localStorage에 저장
    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        token = localStorage.getItem('accessToken');
    }

    // projectName을 sessionStorage에 저장
    if (projectName) {
        sessionStorage.setItem('projectName', projectName);
    } else {
        projectName = sessionStorage.getItem('projectName');
    }

    console.log('Token 상태:', token ? '토큰이 성공적으로 저장되었습니다.' : '토큰이 없습니다.');
    console.log('Project Name 상태:', projectName ? '프로젝트 이름이 성공적으로 저장되었습니다.' : '프로젝트 이름이 없습니다.');

    if (token) {
        // 사용자 정보를 가져와서 네비게이션 바에 표시하는 함수 호출
        fetchUserInfo(token);

        // 프로젝트 목록을 가져옴 (로컬 스토리지에 저장하지 않음)
        fetch('http://localhost:8080/api/personal/repo/list', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
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
            // 프로젝트 데이터를 로컬 스토리지에 저장하는 코드 제거
        })
        .catch(error => console.error('Error:', error));
    }

    var createProjectForm = document.getElementById('create-project-form');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var projectName = document.getElementById('projectName').value;
            var description = document.getElementById('description').value;

            if (token && projectName && description) {
                fetch('/api/personal/repo', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectName: projectName,
                        description: description
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Project creation response:', data);
                    if (data.personalProjectId) {
                        // 프로젝트 생성 후 로컬 스토리지에 저장하는 코드 제거
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
    } else {
        alert('Token is missing. Please log in.');
    }
});

function fetchUserInfo(token) {
    fetch('/api/user/info', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
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

        // 사용자 이름을 네비게이션 바에 표시
        const loginNavItem = document.getElementById('login-nav-item');
        const loginLink = document.getElementById('login-link');

        if (loginLink) {
            loginLink.textContent = `${data.name}`;
            loginLink.href = "/user/profile"; // 프로필 페이지로 링크를 연결합니다.
        }
    })
    .catch(error => console.error('Error fetching user info:', error));
}

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
