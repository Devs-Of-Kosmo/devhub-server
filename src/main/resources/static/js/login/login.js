$(document).ready(function() {
    $('#loginForm').on('submit', function(event) {
        event.preventDefault();

        var email = $('#emailLogin').val().trim();
        var password = $('#passwordLogin').val().trim();

        // 입력 값 유효성 검사
        if (email === '' || password === '') {
            Swal.fire({
                title: '입력 오류',
                text: '이메일과 비밀번호를 모두 입력해주세요.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            return;
        }

        // 이메일 형식 검사
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailPattern.test(email)) {
            Swal.fire({
                title: '입력 오류',
                text: '올바른 이메일 형식을 입력해주세요.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
            return;
        }

        // 비밀번호 길이 검사 (예: 최소 6자 이상)
        if (password.length < 6) {
            Swal.fire({
                title: '입력 오류',
                text: '비밀번호는 최소 6자 이상이어야 합니다.',
                icon: 'warning',
                confirmButtonText: '확인'
            });
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
                location.href = '/';
            },
            error: function(error) {
                var errorMessage = '로그인 실패';
                if (error.responseJSON && error.responseJSON.message) {
                    errorMessage = '로그인 실패: ' + error.responseJSON.message;
                } else if (error.statusText) {
                    errorMessage = '로그인 실패: ' + error.statusText;
                }

                Swal.fire({
                    title: '오류',
                    text: errorMessage,
                    icon: 'error',
                    confirmButtonText: '확인'
                });

                console.error(error);
            }
        });
    });
});
