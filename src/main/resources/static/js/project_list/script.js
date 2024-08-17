import connectWebSocket from '../websocket.js';

document.addEventListener('DOMContentLoaded', function() {
    var sidebarToggle = document.getElementById('sidebar-toggle');
    var slideMenu = document.getElementById('slide-menu');
    var sidebarClose = document.getElementById('sidebar-close');
    var logoutButton = document.getElementById('logout');
    var accessToken = localStorage.getItem('accessToken');

    if (sidebarToggle && slideMenu) {
        sidebarToggle.addEventListener('click', function(event) {
            event.preventDefault();
            slideMenu.classList.toggle('show');
            sidebarToggle.style.display = 'none'; // 사이드바 버튼 숨기기
        });
    }


    if (sidebarClose && slideMenu) {
        sidebarClose.addEventListener('click', function(event) {
            event.preventDefault();
            slideMenu.classList.remove('show');
            sidebarToggle.style.display = 'block'; // 사이드바 버튼 다시 보이기
        });
    }

    if (logoutButton) {
        $('#logout').on('click', function() {
            $.ajax({
                url: '/api/auth/logout',
                type: 'GET',
                headers: { 'Authorization': 'Bearer ' + accessToken },
                success: function() {
                    localStorage.removeItem('accessToken');
                    Swal.fire({
                        title: '로그아웃 성공',
                        text: '로그아웃이 완료되었습니다.',
                        icon: 'success',
                        confirmButtonText: '확인'
                    }).then(() => {
                        window.location.href = 'http://localhost:8080';
                    });
                },
                error: function(xhr, status, error) {
                    console.error('로그아웃 요청 중 오류 발생:', error);
                    Swal.fire('로그아웃 중 오류가 발생했습니다.', '', 'error');
                }
            });
        });
    }

    $(document).ready(function() {
        if (!accessToken) {
            var urlParams = new URLSearchParams(window.location.search);
            accessToken = urlParams.get('token');
            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }
        }

        // 사용자 정보 가져오기
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
                .catch(error => {
                    console.error('Error fetching user info:', error);
                    Swal.fire({
                        icon: 'error',
                        title: '사용자 정보 로드 실패',
                        text: '사용자 정보를 가져오는 데 실패했습니다. 다시 로그인해 주세요.'
                    });
                });
        }

        var projectsArray = [];

        // 개인 프로젝트 목록 가져오기
        function loadProjects() {
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
                        projectsArray = data;
                        displayProjects(projectsArray);
                    })
                    .catch(error => {
                        console.error('Error fetching personal projects:', error);
                        Swal.fire({
                            icon: 'error',
                            title: '프로젝트 로드 실패',
                            text: '프로젝트 목록을 가져오는 데 실패했습니다. 페이지를 새로고침해 주세요.'
                        });
                    });
            } else {
                displayProjects(projectsArray);
            }
        }

        // 프로젝트 표시 기능
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
                    <div class="project-container" data-index="${index}">
                        <div class="folder"></div>
                        <div class="details">
                            <h1>${project.projectName}</h1>
                            <p>${project.description}</p>
                            <div class="date">저장 시간: ${formattedDate}</div>
                            <div class="actions">
                                <button class="edit-btn" data-id="${project.projectId}">수정</button>
                                <button class="delete-btn" data-id="${project.projectId}">삭제</button>
                            </div>
                        </div>
                    </div>
                    `;
                    cardsWrapper.insertAdjacentHTML('beforeend', cardHTML);
                });

                // 프로젝트 클릭 시
                $(document).on('click', '.project-container', function() {
                    // projectName을 가져옵니다.
                    var projectName = $(this).find('h1').text().trim();
                    var url = `http://127.0.0.1:5000/save_token?token=${accessToken}&projectName=${encodeURIComponent(projectName)}`;

                    // 프로젝트 데이터를 포함한 URL로 이동
                    window.location.href = url;
                });

                // 수정 버튼 클릭 시
                $(document).on('click', '.edit-btn', function(event) {
                    event.stopPropagation(); // 부모 요소의 클릭 이벤트 전파 방지
                    var projectId = $(this).data('id');
                    var project = projectsArray.find(p => p.projectId === projectId);
                    if (project) {
                        Swal.fire({
                            title: '프로젝트 수정',
                            html: `
                               <input type="hidden" id="editProjectId" value="${project.projectId}">
                               <input type="text" id="editProjectName" class="swal2-input" value="${project.projectName}" placeholder="프로젝트 이름">
                               <textarea id="editDescription" class="swal2-textarea" placeholder="프로젝트 설명">${project.description}</textarea>
                           `,
                            showCancelButton: true,
                            confirmButtonText: '수정',
                            cancelButtonText: '취소',
                            preConfirm: () => {
                                return {
                                    projectId: document.getElementById('editProjectId').value,
                                    projectName: document.getElementById('editProjectName').value,
                                    description: document.getElementById('editDescription').value
                                };
                            }
                        }).then((result) => {
                            if (result.isConfirmed) {
                                var { projectId, projectName, description } = result.value;
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
                                        Swal.fire({
                                            icon: 'success',
                                            title: '프로젝트 수정 완료',
                                            text: '프로젝트가 성공적으로 수정되었습니다.'
                                        }).then(() => {
                                            loadProjects();
                                        });
                                    })
                                    .catch(error => {
                                        console.error('Error updating project:', error);
                                        Swal.fire({
                                            icon: 'error',
                                            title: '프로젝트 수정 실패',
                                            text: '프로젝트 수정 중 오류가 발생했습니다. 다시 시도해 주세요.'
                                        });
                                    });
                            }
                        });
                    }
                });

                // 삭제 버튼 클릭 시
                $(document).on('click', '.delete-btn', function(event) {
                    event.stopPropagation(); // 부모 요소의 클릭 이벤트 전파 방지
                    var projectId = $(this).data('id');
                    Swal.fire({
                        title: '정말로 이 프로젝트를 삭제하시겠습니까?',
                        text: "삭제 후 되돌릴 수 없습니다! 삭제를 원하면 '삭제하겠습니다' 입력해주세요.",
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
                                        return response.text().then(text => {
                                            throw new Error(text || 'Network response was not ok');
                                        });
                                    }
                                    return response.text().then(text => {
                                        return text ? JSON.parse(text) : {};
                                    });
                                })
                                .then(data => {
                                    Swal.fire({
                                        icon: 'success',
                                        title: '삭제 완료',
                                        text: '프로젝트가 성공적으로 삭제되었습니다.'
                                    }).then(() => {
                                        loadProjects();
                                    });
                                })
                                .catch(error => {
                                    console.error('Error deleting project:', error);
                                    Swal.fire({
                                        icon: 'error',
                                        title: '삭제 실패',
                                        text: '프로젝트 삭제 중 오류가 발생했습니다. 다시 시도해 주세요.'
                                    });
                                });
                        }
                    });
                });
            } else {
                console.error('cardsWrapper element not found.');
            }
        }

        // 초기 프로젝트 로드
        loadProjects();
    });
});
