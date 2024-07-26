$(document).ready(function() {
    // 전체 동의 체크박스 클릭 시 개별 체크박스 모두 선택/해제
    $('#flexCheckAll').on('change', function() {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"]').prop('checked', isChecked);
    });

    // 이메일 인증 버튼 클릭 시
    $('#emailVerifyBtn').on('click', function() {
        var email = $('#email').val();
        // 이메일 유효성 검사
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            alert('유효한 이메일 주소를 입력하세요.');
        } else {
            alert('유효한 이메일 주소입니다.');
        }
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

        // 비밀번호 확인 검증
        var password = $('#password').val();
        var confirmPassword = $('#confirm_password').val();

        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
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
            password: password
        };

        $.ajax({
            type: 'POST',
            url: '/api/user/public/signup', // 회원가입 API 엔드포인트
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('Registration successful!');
                location.href = '/login';
            },
            error: function(error) {
                console.error('Error:', error);
                alert('비밀번호는 8글자이상에 특수문자를 하나 포함해야합니다.');
            }
        });
    });
});