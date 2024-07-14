$(document).ready(function() {
    // JWT 토큰 가져오기
    var accessToken = localStorage.getItem('accessToken');

    // 토큰이 있는 경우 사용자 정보 조회
    if (accessToken) {
        $.ajax({
            type: 'GET',
            url: '/api/user/info',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                // 사용자 정보 가져오기
                var userName = response.name;
                // 로그인 링크를 사용자 이름으로 변경
                $('#login-link').text(userName + '님');
            },
            error: function(error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        });
    }
});
