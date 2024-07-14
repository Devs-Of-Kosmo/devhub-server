$(document).ready(function() {
    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

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