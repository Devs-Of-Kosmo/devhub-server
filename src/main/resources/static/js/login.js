$(document).ready(function() {
    $('#loginForm').on('submit', function(event) {
        event.preventDefault();

        var email = $('#emailLogin').val().trim();
        var password = $('#passwordLogin').val().trim();

        // 입력 값 유효성 검사
        if (email === '' || password === '') {
            alert('이메일과 비밀번호를 모두 입력해주세요.');
            return;
        }

        // 이메일 형식 검사
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            alert('올바른 이메일 형식을 입력해주세요.');
            return;
        }

        // 비밀번호 길이 검사 (예: 최소 6자 이상)
        if (password.length < 6) {
            alert('비밀번호는 최소 6자 이상이어야 합니다.');
            return;
        }

        var formData = {
            email: email,
            password: password
        };

        $.ajax({
            type: 'POST',
            url: '/api/auth/public/login',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                var accessToken = response.accessToken;
                localStorage.setItem('accessToken', accessToken);
                window.location.href = 'main';
            },
            error: function(error) {
                if (error.responseJSON) {
                    alert('로그인 실패: ' + error.responseJSON.message);
                } else {
                    alert('로그인 실패: ' + error.statusText);
                }
                console.error(error);
            }
        });
    });
});
