import connectWebSocket from '../websocket.js';
$(document).ready(function() {
    $('#menu-toggle').click(function() {
        let menu = $('#slide-menu');
        if (menu.css('left') === '-250px') {
            menu.css('left', '0');
        } else {
            menu.css('left', '-250px');
        }
    });

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
        fetch('/api/personal/repo/list', {
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
                            <div class="card" data-index="${index}" style="cursor: pointer; background-color: rgb(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)});">
                                <div>
                                    <div class="num">${String(index + 1).padStart(2, '0')}</div>
                                    <div class="date">저장 시간: ${formattedDate}</div>
                                    <br>
                                    <br>
                                    <br>
                                    <br>
                                    <br>
                                    <br>
                                    <h1>${project.projectName}</h1>
                                    <p>${project.description}</p>
                                    <div class="tags">
                                        <div class="tag">Project</div>
                                    </div>
                                </div>
                            </div>
                            <div class="card-buttons">
                                <button class="btn btn-warning btn-edit" data-id="${project.projectId}">수정</button>
                                <button class="btn btn-danger btn-delete" data-id="${project.projectId}">삭제</button>
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

    // 프로젝트 수정 모달 열기
    $(document).on('click', '.btn-edit', function() {
        var projectId = $(this).data('id');
        var project = projectsArray.find(p => p.projectId === projectId);
        if (project) {
            $('#editProjectId').val(project.projectId);
            $('#editProjectName').val(project.projectName);
            $('#editDescription').val(project.description);
            $('#editProjectModal').modal('show');
        }
    });

    // 프로젝트 수정 요청
    $('#editProjectForm').submit(function(event) {
        event.preventDefault();
        var projectId = $('#editProjectId').val();
        var projectName = $('#editProjectName').val();
        var description = $('#editDescription').val();

        fetch('/api/personal/repo', {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: projectId,
                changedProjectName: projectName,
                changedDescription: description
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    var project = projectsArray.find(p => p.projectId === projectId);
                    if (project) {
                        project.projectName = projectName;
                        project.description = description;
                        displayProjects(projectsArray);
                    }
                    $('#editProjectModal').modal('hide');
                    Swal.fire({
                        icon: 'success',
                        title: '프로젝트 수정 완료',
                        text: '프로젝트가 성공적으로 수정되었습니다.'
                    }).then(() => {
                        window.location.href = 'http://localhost:8080/project_list';
                    });
                } else {
                    window.location.href = 'http://localhost:8080/project_list';
                }
            })
            .catch(error => console.error('Error updating project:', error));
    });

    // 프로젝트 삭제
    $(document).on('click', '.btn-delete', function() {
        var projectId = $(this).data('id');
        Swal.fire({
            title: '정말로 이 프로젝트를 삭제하시겠습니까?',
            text: "삭제 후 되돌릴 수 없습니다! 삭제를 원하면'삭제하겠습니다' 입력해주세요.",
            input: 'text',
            inputPlaceholder: '삭제하겠습니다',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '삭제',
            preConfirm: (inputValue) => {
                if (inputValue !== '삭제하겠습니다') {
                    Swal.showValidationMessage('입력값이 올바르지 않습니다.');
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/api/personal/repo/${projectId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + accessToken,
                        'Content-Type': 'application/json'
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.text().then(text => text ? JSON.parse(text) : {});
                    })
                    .then(data => {
                        if (data.success) {
                            projectsArray = projectsArray.filter(p => p.projectId !== projectId);
                            displayProjects(projectsArray);
                            Swal.fire({
                                icon: 'success',
                                title: '삭제 완료',
                                text: '프로젝트가 성공적으로 삭제되었습니다.'
                            }).then(() => {
                                window.location.href = 'http://localhost:8080/project_list';
                            });
                        } else {
                            window.location.href = 'http://localhost:8080/project_list';
                        }
                    })
                    .catch(error => console.error('Error deleting project:', error));
            }
        });
    });
});
