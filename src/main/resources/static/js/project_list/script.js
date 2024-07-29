document.addEventListener('DOMContentLoaded', function() {
    // URL에서 토큰을 추출하고 로컬 스토리지에 저장
    var urlParams = new URLSearchParams(window.location.search);
    console.log('URL Parameters:', urlParams.toString());

    var accessToken = urlParams.get('token'); // 'access_token'에서 'token'으로 수정
    var projectsToken = urlParams.get('projects');
    console.log('Access Token from URL:', accessToken);
    console.log('Projects Token from URL:', projectsToken);

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    } else {
        accessToken = localStorage.getItem('accessToken');
    }
    if (projectsToken) {
        localStorage.setItem('projects', projectsToken);
    } else {
        projectsToken = localStorage.getItem('projects');
    }

    console.log('Retrieved Access Token:', accessToken);
    console.log('Retrieved Projects Token:', projectsToken);

    if (accessToken) {
        fetch('/user_info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);

            if (data.name) {
                var loginNavItem = document.getElementById('login-nav-item');
                if (loginNavItem) {
                    loginNavItem.innerHTML = '<a href="/profile" class="nav-link">' + data.name + '님</a>';
                }
            }
        })
        .catch(error => console.error('Error:', error));
    }

    if (projectsToken) {
        fetch('/projects_info', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'projectsToken': projectsToken
            })
        })
        .then(response => {
            console.log('Projects Response status:', response.status);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Projects data:', data);

            if (data.projects) {
                localStorage.setItem('projects', JSON.stringify(data.projects));
                console.log('Projects data saved to localStorage.');
            } else {
                console.error('Projects data is missing or malformed');
            }
        })
        .catch(error => console.error('Error fetching projects:', error));
    } else {
        console.warn('No projects token found in URL or localStorage.');
    }

    var projectsData = localStorage.getItem('projects');
    var projectsArray = [];

    console.log('Raw projectsData:', projectsData);

    try {
        projectsArray = JSON.parse(projectsData) || [];
        console.log('Parsed projects:', projectsArray);

        if (!Array.isArray(projectsArray)) {
            console.warn('Projects data is not an array. Initializing to empty array.');
            projectsArray = [];
        }
    } catch (error) {
        console.error('Error parsing projects data from localStorage:', error);
        projectsArray = [];
    }

    var cardsWrapper = document.querySelector('.cards-wrapper');
    if (cardsWrapper) {
        projectsArray.forEach(function(project, index) {
            if (!project.projectName || !project.description) {
                console.warn(`Invalid project data at index ${index}:`, project);
                return;
            }

            var cardHTML = `
                <div class="card-grid-space">
                    <div class="num">${String(index + 1).padStart(2, '0')}</div>
                    <div class="card" data-index="${index}" style="cursor: pointer; background-color: rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)});">
                        <div>
                            <h1>${project.projectName}</h1>
                            <p>${project.description}</p>
                            <div class="date">저장 시간</div>
                            <div class="tags">
                                <div class="tag">Project</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            cardsWrapper.insertAdjacentHTML('beforeend', cardHTML);
        });

        cardsWrapper.addEventListener('click', function(event) {
            var card = event.target.closest('.card');
            if (card) {
                var index = card.getAttribute('data-index');
                var url = 'http://127.0.0.1:5000';
                if (accessToken) {
                    url += '?token=' + accessToken;
                }
                if (projectsToken) {
                    url += '&projects=' + projectsToken;
                }
                url += '&projectsData=' + encodeURIComponent(JSON.stringify(projectsArray));
                window.location.href = url;
            }
        });
    } else {
        console.error('cardsWrapper element not found.');
    }

    if (accessToken) {
        var myProjectsLink = document.getElementById('my-projects-link');
        if (myProjectsLink) {
            myProjectsLink.href = 'http://127.0.0.1:5000/?token=' + accessToken;
            if (projectsToken) {
                myProjectsLink.href += '&projects=' + projectsToken;
            }
            myProjectsLink.href += '&projectsData=' + encodeURIComponent(JSON.stringify(projectsArray));
        }
    }

    // 개인 프로젝트 생성 폼 제출 핸들러
    var createProjectForm = document.getElementById('create-project-form');
    if (createProjectForm) {
        createProjectForm.addEventListener('submit', function(event) {
            event.preventDefault();

            var projectName = document.getElementById('projectName').value;
            var description = document.getElementById('description').value;

            if (accessToken && projectName && description) {
                fetch('/api/personal/create', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
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
                console.error('Missing access token or project details.');
            }
        });
    }
});
