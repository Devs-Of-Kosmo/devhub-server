
$(document).ready(function() {
    // 전체 동의 체크박스 클릭 시 개별 체크박스 모두 선택/해제
    $('#flexCheckAll').on('change', function() {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"]').prop('checked', isChecked);
    });

    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        // 이메일 형식 검증
        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            alert('Please enter a valid email address.');
            return; // 폼 제출 중단
        }

        // 필수 이용약관 동의 확인
        if (!$('#termsCheck1').is(':checked') || !$('#termsCheck2').is(':checked')) {
            alert('서비스 이용약관과 개인정보 처리방침에 동의해야 합니다.');
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
                location.href = '/';
            },
            error: function(error) {
                alert('Registration failed!');
                // 회원가입 실패 시 처리할 내용 추가
            }
        });

    });
});
