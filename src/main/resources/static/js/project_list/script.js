document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var accessToken = urlParams.get('token');
    var projectsToken = urlParams.get('projects');

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

    // 사용자 정보 가져오기
    if (accessToken) {
        fetch('/user_info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.name) {
                    var loginNavItem = document.getElementById('login-nav-item');
                    if (loginNavItem) {
                        loginNavItem.innerHTML = '<a href="/profile" class="nav-link">' + data.name + '님</a>';
                    }
                }
            })
            .catch(error => console.error('Error:', error));
    }

    var projectsArray = [];
    if (projectsToken) {
        fetch('/projects_info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.projects) {
                    localStorage.setItem('projects', JSON.stringify(data.projects));
                    projectsArray = data.projects;
                }
            })
            .catch(error => console.error('Error fetching projects:', error));
    } else {
        var projectsData = localStorage.getItem('projects');
        try {
            projectsArray = JSON.parse(projectsData) || [];
        } catch (error) {
            console.error('Error parsing projects data from localStorage:', error);
            projectsArray = [];
        }
    }

    // 개인 프로젝트 목록 가져오기
    if (accessToken) {
        fetch('/api/personal/read', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Personal projects:', data);
                projectsArray = projectsArray.concat(data);
                localStorage.setItem('projects', JSON.stringify(projectsArray));
                displayProjects(projectsArray);
            })
            .catch(error => console.error('Error fetching personal projects:', error));
    } else {
        displayProjects(projectsArray);
    }

    function displayProjects(projects) {
        var cardsWrapper = document.querySelector('.cards-wrapper');
        if (cardsWrapper) {
            cardsWrapper.innerHTML = ''; // 기존 카드 지우기
            projects.forEach(function(project, index) {
                if (!project.projectName || !project.description) {
                    console.warn(`Invalid project data at index ${index}:`, project);
                    return;
                }

                var createdDate = project.createdDate ? new Date(project.createdDate) : null;
                var formattedDate = createdDate ? createdDate.toLocaleDateString() + ' ' + createdDate.toLocaleTimeString() : 'Unknown Date';

                var cardHTML = `
                    <div class="card-grid-space">
                        <div class="num">${String(index + 1).padStart(2, '0')}</div>
                        <div class="card" data-index="${index}" style="cursor: pointer; background-color: rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)});">
                            <div>
                                <h1>${project.projectName}</h1>
                                <p>${project.description}</p>
                                <div class="date">저장 시간: ${formattedDate}</div>
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
    }

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
                        projectsToken: projectsToken
                    })
                })
                    .then(response => response.json())
                    .then(data => {
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
});
