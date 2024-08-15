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
            console.log('Projects:', projects); // 응답 데이터 콘솔 출력
            renderProjects(projects);
        },
        error: function(xhr, status, error) {
            console.error("Error fetching projects:", status, error, xhr.responseText);
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
        }
    });
}

function loadMyBoards() {
    const token = localStorage.getItem('accessToken'); // 로컬 스토리지에서 JWT 토큰 가져오기

    $.ajax({
        url: '/api/user/info',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        success: function(data) {
            console.log('User Info:', data); // 서버에서 받은 전체 데이터를 출력

            // userInfo 객체에서 userId를 가져오는 방법
            const userId = data.id || data.userId || data.data?.id;
            console.log('User ID:', userId);

            if (userId) {
                // userId가 올바르게 존재할 때만 fetchMyBoards 호출
                fetchMyBoards(userId, token);
            } else {
                console.error('User ID is undefined');
                alert('사용자 정보를 가져오는 데 문제가 발생했습니다.');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error fetching user info:', error);
            if (xhr.status === 401) {
                alert('인증 오류가 발생했습니다. 권한을 확인해주세요.');
            } else {
                alert('사용자 정보를 가져오지 못했습니다. 다시 시도해주세요.');
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
                alert('인증 오류가 발생했습니다. 권한을 확인해주세요.');
            } else {
                alert('게시글을 가져오지 못했습니다. 다시 시도해주세요.');
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
        var writerName = extractUserName(project.writer); // writer 문자열에서 이름 추출

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
            console.log('Project Details:', project); // 응답 데이터 콘솔 출력
            $("#update-project-id").val(project.id);
            $("#update-title").val(project.title);
            $("#update-content").val(project.content);
            $("#update-writer").val(extractUserName(project.writer)); // 이름만 사용

            if (project.imagePath) {
                $("#update-imagePreview").attr("src", project.imagePath).show();
            } else {
                $("#update-imagePreview").hide();
            }

            $('#updateProjectModal').modal('show');
        },
        error: function(xhr, status, error) {
            console.error("Error fetching project details:", status, error, xhr.responseText);
        }
    });
}

function deleteProject(id) {
    if (!confirm("정말로 이 프로젝트를 삭제하시겠습니까?")) {
        return;
    }

    const token = localStorage.getItem('accessToken'); // JWT 토큰을 로컬 스토리지에서 가져옴

    $.ajax({
        url: `/api/boards/${id}`,
        type: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}` // 헤더에 JWT 토큰 추가
        },
        success: function(response) {
            loadProjects();
        },
        error: function(xhr, status, error) {
            console.error("Error deleting project:", status, error, xhr.responseText);
            if (xhr.status === 401) {
                alert('인증이 만료되었습니다. 다시 로그인해주세요.');
                window.location.href = '/login';
            }
        }
    });
}