$(document).ready(function() {
    $('#loginForm').on('submit', function(event) {
        event.preventDefault();

        var formData = {
            email: $('#emailLogin').val(),
            password: $('#passwordLogin').val()
        };

        $.ajax({
            type: 'POST',
            url: '/api/auth/public/login', // 로그인 API 엔드포인트
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                var userName = response.name; // 서버 응답에 사용자 이름이 포함되어 있다고 가정
                localStorage.setItem('name', userName); // localStorage에 사용자 이름 저장
                window.location.href = 'main'; // 메인 페이지로 리디렉션
            },
            error: function(error) {
                if (error.responseJSON) {
                    alert('Login failed: ' + error.responseJSON.message);
                } else {
                    alert('Login failed: ' + error.statusText);
                }
                console.error(error);
            }
        });
    });

    // 페이지 로드 시 로그인 링크 업데이트
    var userName = localStorage.getItem('name') || '로그인';
    $('#login-link').text(userName + '님');
});
