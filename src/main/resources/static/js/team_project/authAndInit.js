// 로그인 함수
window.login = function() {
    const email = $('#loginEmail').val();
    const password = $('#loginPassword').val();

    $.ajax({
        url: '/api/auth/public/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email, password }),
        success: function(data) {
            localStorage.setItem('accessToken', data.accessToken);
            window.closeWindow('loginModal');
            location.reload();
        },
        error: function() {
            console.error('Login error');
            alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
        }
    });
}

// 로그아웃 함수
window.logout = function() {
    localStorage.removeItem('accessToken');
    location.reload();
}

// 초기 설정
$(document).ready(function() {
    window.loadTrashedTeamsFromLocalStorage();

    if (window.getAccessToken()) {
        window.sendAuthenticatedRequest('/api/user/info', 'GET')
            .done(function(userInfo) {
                console.log('User Info:', userInfo);
                $('#logoutButton').show();
                window.loadUserTeams()
                    .done(function() {
                        // 이벤트 리스너 설정
                        $('#Desktop .icon[data-title]').on('click', function() {
                            window.handleIconClick($(this), $(this).attr('data-title'));
                        });
                        $('#joinProject button').on('click', function() {
                            window.closeWindow('joinProject');
                        });
                        $('#listProjects button').on('click', function() {
                            window.closeWindow('listProjects');
                        });
                        $('#logoutButton').on('click', window.logout);
                        $('#editMenu').on('click', function() {
                            window.populateEditProjectModal();
                            window.openWindow('editProject');
                        });
                        $('#trashCan').on('dblclick', window.openTrashModal);
                        $('#closeTrashBtn').on('click', function() {
                            $('#trashModal').hide();
                        });
                        $('#emptyTrashBtn').on('click', window.emptyTrash);
                    });
            })
            .fail(function(error) {
                console.error('Authentication error:', error);
                window.openWindow('loginModal');
            });
    } else {
        window.openWindow('loginModal');
    }

    $('#createProjectButton').on('click', window.createNewProject);
    $('#loginButton').on('click', window.login);
    $('#saveTeamChangesButton').on('click', function() {
        const selectedProjectId = $('#selectProject').val();
        window.updateTeamInfo(selectedProjectId);
    });
});