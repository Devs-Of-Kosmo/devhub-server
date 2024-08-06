import connectWebSocket from '../websocket.js';

document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var accessToken = urlParams.get('token');

    if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
    } else {
        accessToken = localStorage.getItem('accessToken');
    }

    if (accessToken) {
        fetch('/api/user/info', {
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

                var socketEmail = data.email;
                connectWebSocket(socketEmail);
            })
            .catch(error => console.error('Error fetching user info:', error));
    }

    var projectsArray = [];

    if (accessToken) {
        fetch('/api/personal/repo/read', {
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
                projectsArray = data;
                displayProjects(projectsArray);

            })
            .catch(error => console.error('Error fetching personal projects:', error));
    } else {
        displayProjects(projectsArray);
    }

    function displayProjects(projects) {
        var cardsWrapper = document.querySelector('.cards-wrapper');
        if (cardsWrapper) {
            cardsWrapper.innerHTML = '';
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

            fetch('/api/personal/repo/create', {
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
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.newProjectId) {
                        var newProject = {
                            projectId: data.newProjectId,
                            projectName: projectName,
                            description: description,
                            masterId: data.masterId,
                            createdDate: new Date().toISOString()
                        };

                        projectsArray.push(newProject);
                        window.location.reload(); // 페이지 새로고침
                    } else {
                        console.error('Project creation failed:', data);
                    }
                })
                .catch(error => console.error('Error creating project:', error));
        });
    }

    if (accessToken) {
        var myProjectsLink = document.getElementById('my-projects-link');
        if (myProjectsLink) {
            myProjectsLink.href = 'http://127.0.0.1:5000/?token=' + accessToken;
        }
    }
});
