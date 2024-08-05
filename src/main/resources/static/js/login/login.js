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

                // 메인 페이지로 리다이렉트
                window.location.href = '/';
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
