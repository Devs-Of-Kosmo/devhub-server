$(document).ready(function() {
    let sentToEmail = '';
    let isCodeSent = false; // 인증 코드 발송 여부 플래그

    // 전체 동의 체크박스 클릭 시 개별 체크박스 모두 선택/해제
    $('#flexCheckAll').on('change', function() {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"]').prop('checked', isChecked);
    });

    // 이메일 형식 확인 및 인증 코드 발송 버튼 클릭 시
    $('#emailVerifyBtn').on('click', function() {
        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            alert('유효한 이메일 주소를 입력하세요.');
        } else {
            // 이메일이 유효할 때, 서버로 인증번호 발송 요청
            $.ajax({
                type: 'POST',
                url: '/api/mail/public/send',
                data: JSON.stringify({ email: email }),
                contentType: 'application/json',
                success: function(response) {
                    if (response.toEmail) {
                        sentToEmail = response.toEmail;
                        isCodeSent = true; // 인증 코드 발송 여부 플래그 설정
                        $('#verifyCodeBtn').text('인증 코드 확인');
                        $('#verifyCodeBtn').prop('disabled', false); // 인증 코드 확인 버튼 활성화
                        alert('인증번호가 발송되었습니다. 이메일을 확인하세요.');
                    } else {
                        alert('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
                    }
                },
                error: function(error) {
                    console.error('Error:', error);
                    alert('인증번호 발송 중 오류가 발생했습니다.');
                }
            });
        }
    });

    // 인증 코드 확인 버튼 클릭 시
    $('#verifyCodeBtn').on('click', function() {
        if (!isCodeSent) {
            alert('먼저 인증 코드를 발송해주세요.');
            return;
        }

        var inputCode = $('#verification_code').val();

        if (sentToEmail && inputCode) {
            $.ajax({
                type: 'POST',
                url: '/api/mail/public/check',
                data: JSON.stringify({ email: sentToEmail, authenticationCode: inputCode }),
                contentType: 'application/json',
                success: function(response) {
                    if (response.verified) {
                        alert('이메일 인증이 완료되었습니다.');
                    } else {
                        alert('인증번호가 일치하지 않습니다.');
                    }
                },
                error: function(error) {
                    console.error('Error:', error);
                    alert('인증번호 확인 중 오류가 발생했습니다.');
                }
            });
        } else {
            alert('이메일과 인증번호를 입력해 주세요.');
        }
    });

    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            alert('유효한 이메일 주소를 입력하세요.');
            return;
        }

        var password = $('#password').val();
        var confirmPassword = $('#confirm_password').val();

        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        if (!$('#termsCheck1').is(':checked') || !$('#termsCheck2').is(':checked')) {
            alert('서비스 이용약관과 개인정보 처리방침에 동의해야 합니다.');
            return;
        }

        var formData = {
            name: $('#name').val(),
            email: $('#email').val(),
            password: password
        };

        $.ajax({
            type: 'POST',
            url: '/api/user/public/signup',
            data: JSON.stringify(formData),
            contentType: 'application/json',
            success: function(response) {
                alert('회원가입이 완료되었습니다!');
                location.href = '/login';
            },
            error: function(error) {
                console.error('Error:', error);
                alert('회원가입 중 오류가 발생했습니다.');
            }
        });
    });
});
