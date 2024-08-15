// JWT 토큰을 포함한 인증된 요청을 보내는 함수
function sendAuthenticatedRequest(url, method = 'GET', data = null) {
    return $.ajax({
        url: url,
        type: method,
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
        },
        error: function(jqXHR) {
            if (jqXHR.status === 401) {
                alert('세션이 만료되었습니다. 다시 로그인해주세요.');
                openWindow('loginModal');
            }
        }
    });
}

// 로그인 함수
function login() {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    $.ajax({
        url: '/api/auth/public/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(data) {
            localStorage.setItem('accessToken', data.accessToken);
            closeWindow('loginModal');
            location.reload();
        },
        error: function() {
            console.error('Login error');
            alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    });
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('accessToken');
    location.reload();
}

// Edit 모달에 프로젝트 목록을 채우는 함수
function populateEditProjectModal() {
    const projectList = $('#Desktop .icon[data-team-id]');
    const selectProject = $('#selectProject');
    selectProject.empty();

    projectList.each(function() {
        const teamId = $(this).attr('data-team-id');
        const teamName = $(this).find('.title').text();
        selectProject.append($('<option>').val(teamId).text(teamName));
    });

    selectProject.on('change', function() {
        const selectedProject = $(`#Desktop .icon[data-team-id="${selectProject.val()}"]`);
        $('#editTeamName').val(selectedProject.find('.title').text());
    });

    if (selectProject.find('option').length > 0) {
        selectProject.prop('selectedIndex', 0).trigger('change');
    }
}

// 초기 설정
$(document).ready(function() {
    loadTrashedTeamsFromLocalStorage();

    if (localStorage.getItem('accessToken')) {
        sendAuthenticatedRequest('/api/user/info', 'GET')
            .done(function(userInfo) {
                console.log('User Info:', userInfo);
                $('#logoutButton').show();
                setInterval(updateClock, 1000);
                updateClock();

                loadUserTeams()
                    .done(function() {
                        $('#Desktop .icon[data-title]').on('click', function() {
                            handleIconClick($(this), $(this).attr('data-title'));
                        });

                        $('#joinProject button').on('click', function() {
                            closeWindow('joinProject');
                        });

                        $('#listProjects button').on('click', function() {
                            closeWindow('listProjects');
                        });

                        $('#logoutButton').on('click', logout);

                        $('#editMenu').on('click', function() {
                            populateEditProjectModal();
                            openWindow('editProject');
                        });

                        $('#trashCan').on('dblclick', openTrashModal);

                        $('#closeTrashBtn').on('click', function() {
                            $('#trashModal').hide();
                        });

                        $('#emptyTrashBtn').on('click', emptyTrash);
                    });
            })
            .fail(function(error) {
                console.error('Authentication error:', error);
                openWindow('loginModal');
            });
    } else {
        openWindow('loginModal');
    }

    $('#createProjectButton').on('click', createNewProject);
    $('#loginButton').on('click', login);
    $('#saveTeamChangesButton').on('click', function() {
        const selectedProjectId = $('#selectProject').val();
        updateTeamInfo(selectedProjectId);
    });
});