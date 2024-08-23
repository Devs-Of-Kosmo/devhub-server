$(document).ready(function() {
    AOS.init(); // AOS 초기화
    loadProjects();

    $("#searchInput").on("input", function() {
        var keyword = $(this).val();
        if (keyword) {
            searchProjects(keyword);
        } else {
            loadProjects();
        }
    });

    $("#myBoardsLink").on("click", function() {
        loadMyBoards();
    });
});

function loadProjects() {
    $.ajax({
        url: "/api/boards/public",
        type: "GET",
        dataType: "json",
        success: function(projects) {
            console.log('Projects:', projects);
            renderProjects(projects);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching projects:", status, error, xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: '오류',
                text: '프로젝트를 불러오는 중 문제가 발생했습니다.'
            });
        }
    });
}

function searchProjects(keyword) {
    $.ajax({
        url: "/api/boards/public/search",
        type: "GET",
        data: { keyword: keyword },
        dataType: "json",
        success: function(projects) {
            renderProjects(projects);
        },
        error: function(xhr, status, error) {
            console.error("Error searching projects:", status, error, xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: '검색 오류',
                text: '프로젝트 검색 중 문제가 발생했습니다.'
            });
        }
    });
}

function loadMyBoards() {
    const token = localStorage.getItem('accessToken');

    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(data) {
            console.log('User Info:', data);
            const userId = data.id || data.userId || data.data?.id;
            console.log('User ID:', userId);

            if (userId) {
                fetchMyBoards(userId, token);
            } else {
                console.error('User ID is undefined');
                Swal.fire({
                    icon: 'error',
                    title: '사용자 정보 오류',
                    text: '사용자 정보를 가져오는 데 문제가 발생했습니다.'
                });
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching user info:', error);
            if (xhr.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '권한을 확인해주세요.',
                    confirmButtonText: '로그인 페이지로 이동',
                    showCancelButton: true,
                    cancelButtonText: '취소'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: '사용자 정보를 가져오지 못했습니다. 다시 시도해주세요.'
                });
            }
        }
    });
}

function fetchMyBoards(userId, token) {
    $.ajax({
        url: `/api/boards/myboards/${userId}`,
        type: "GET",
        dataType: "json",
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(boards) {
            console.log('My Boards:', boards);
            renderProjects(boards);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching my boards:", status, error, xhr.responseText);
            if (xhr.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: '인증 오류',
                    text: '권한을 확인해주세요.',
                    confirmButtonText: '로그인 페이지로 이동',
                    showCancelButton: true,
                    cancelButtonText: '취소'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/login';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: '오류',
                    text: '게시글을 가져오지 못했습니다. 다시 시도해주세요.'
                });
            }
        }
    });
}

function extractUserName(writerString) {
    const nameMatch = writerString.match(/name=([^,]+)/);
    return nameMatch ? nameMatch[1] : '알 수 없음';
}

function renderProjects(projects) {
    var projectContainer = $("#projectContainer");
    projectContainer.empty();

    if (projects.length === 0) {
        projectContainer.append('<p class="text-center">프로젝트가 없습니다.</p>');
        return;
    }

    projects.forEach(function(project) {
        var writerName = extractUserName(project.writer);

        var projectHtml = `
            <div class="col-md-4 mb-4" data-aos="fade-up">
                <div class="card" onclick="location.href='/boards/${project.id}'">
                  <img src="${project.imagePath ? project.imagePath + '?v=' + new Date().getTime() : '/static/css/images/logo_1.jpg'}" class="card-img-top" alt="Project Image">
                    <div class="card-body">
                        <h5 class="card-title">${project.title}</h5>
                        <p class="card-text"><small class="text-muted">작성자: ${writerName}</small></p>
                    </div>
                </div>
            </div>
        `;

        projectContainer.append(projectHtml);
    });
}

function openUpdateModal(id) {
    $.ajax({
        url: "/api/boards/" + id,
        type: "GET",
        dataType: "json",
        success: function(project) {
            console.log('Project Details:', project);
            $("#update-project-id").val(project.id);
            $("#update-title").val(project.title);
            $("#update-content").val(project.content);
            $("#update-writer").val(extractUserName(project.writer));

            if (project.imagePath) {
                $("#update-imagePreview").attr("src", project.imagePath).show();
            } else {
                $("#update-imagePreview").hide();
            }

            $('#updateProjectModal').modal('show');
        },
        error: function(xhr, status, error) {
            console.error("Error fetching project details:", status, error, xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: '오류',
                text: '프로젝트 정보를 가져오는 중 문제가 발생했습니다.'
            });
        }
    });
}

function deleteProject(id) {
    Swal.fire({
        title: '프로젝트 삭제',
        text: "정말로 이 프로젝트를 삭제하시겠습니까?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '삭제',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            const token = localStorage.getItem('accessToken');

            $.ajax({
                url: `/api/boards/${id}`,
                type: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                success: function(response) {
                    loadProjects();
                    Swal.fire(
                        '삭제 완료!',
                        '프로젝트가 성공적으로 삭제되었습니다.',
                        'success'
                    );
                },
                error: function(xhr, status, error) {
                    console.error("Error deleting project:", status, error, xhr.responseText);
                    if (xhr.status === 401) {
                        Swal.fire({
                            icon: 'error',
                            title: '인증 오류',
                            text: '인증이 만료되었습니다. 다시 로그인해주세요.',
                            confirmButtonText: '로그인 페이지로 이동'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                window.location.href = '/login';
                            }
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: '삭제 실패',
                            text: '프로젝트 삭제 중 문제가 발생했습니다.'
                        });
                    }
                }
            });
        }
    });
}