
$(document).ready(function() {
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        // 이메일 형식 검증
        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return; // 폼 제출 중단
        }

        var formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            password: $('#password').val()
        };

        $.ajax({
            type: 'POST',
            url: '/api/user/public/signup', // 회원가입 API 엔드포인트
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Registration successful!');
                location.href = 'main';
            },
            error: function(error) {
                alert('Registration failed!');
                // 회원가입 실패 시 처리할 내용 추가
            }
        });
    });
});
