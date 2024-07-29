document.getElementById('next').onclick = function(){
        let lists = document.querySelectorAll('.item');
        document.getElementById('slide').appendChild(lists[0]);
    }
    document.getElementById('prev').onclick = function(){
        let lists = document.querySelectorAll('.item');
        document.getElementById('slide').prepend(lists[lists.length - 1]);
    }

document.addEventListener('DOMContentLoaded', function() {
    // URL에서 토큰을 추출하고 로컬 스토리지에 저장
    var urlParams = new URLSearchParams(window.location.search);
    var token = urlParams.get('token');
    var projectsToken = urlParams.get('projects');
    console.log('Token from URL:', token);  // URL에서 가져온 토큰을 콘솔에 출력하여 확인
    console.log('Projects Token from URL:', projectsToken);  // URL에서 가져온 projects 토큰을 콘솔에 출력하여 확인

    if (token) {
        localStorage.setItem('accessToken', token);
    } else {
        token = localStorage.getItem('accessToken');
    }
    if (projectsToken) {
        localStorage.setItem('projects', projectsToken);
    } else {
        projectsToken = localStorage.getItem('projects');
    }

    console.log('Retrieved token:', token);  // 토큰을 콘솔에 출력하여 확인
    console.log('Retrieved Projects Token:', projectsToken);  // projects 토큰을 콘솔에 출력하여 확인

    if (token) {
        fetch('/user_info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            console.log('Response status:', response.status);  // 응답 상태 코드를 콘솔에 출력
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);  // 응답 데이터를 콘솔에 출력

            if (data.name) {
                var loginNavItem = document.getElementById('login-nav-item');
                if (loginNavItem) {
                    loginNavItem.innerHTML = '<a href="/profile" class="nav-link">' + data.name + '님</a>';
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    var createProjectForm = document.getElementById('create-project-form');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var projectName = document.getElementById('projectName').value;
            var description = document.getElementById('description').value;
            var projectsToken = localStorage.getItem('projects'); // localStorage에서 projectsToken 가져오기

            if (token && projectName && description && projectsToken) {
                fetch('/api/personal/create', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        projectName: projectName,
                        description: description,
                        projectsToken: projectsToken // 요청 본문에 projectsToken 포함
                    })
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Project creation response:', data);
                    if (data.personalProjectId) {
                        projectsArray.push(data);
                        localStorage.setItem('projects', JSON.stringify(projectsArray));
                        window.location.reload();
                    } else {
                        console.error('Project creation failed:', data);
                    }
                })
                .catch(error => console.error('Error creating project:', error));
            } else {
                console.error('Missing access token, project details, or projects token.');
            }
        });
    }
    // 프로젝트 토큰에서 프로젝트 명을 추출하여 표시
    if (projectsToken) {
                var projects = JSON.parse(projectsToken);
                var slideContainer = document.getElementById('slide');
                projects.forEach(function(project) {
                    var projectItem = document.createElement('div');
                    projectItem.className = 'item';
                    projectItem.style.backgroundImage = "url('/static/img/background.jpg')"; // 기본 배경 이미지
                    projectItem.innerHTML = `
                        <div class="content">
                            <div class="name">${project.projectName}</div>
                            <div class="des">${project.description}</div>
                            <button>See more</button>
                        </div>
                    `;
                    slideContainer.appendChild(projectItem);
                });
            }
});
