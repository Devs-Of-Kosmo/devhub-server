$(document).ready(function () {
    let sentToEmail = '';
    let isCodeSent = false; // 인증 코드 발송 여부 플래그
    let isEmailVerified = false; // 이메일 인증 여부 플래그

    // 개별 약관 모달 동의 버튼 클릭 시 체크박스 체크
    $('.agree-btn').on('click', function() {
        var checkId = $(this).data('check');
        $('#' + checkId).prop('checked', true);
        $('.modal').modal('hide');
    });

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
            Swal.fire('유효한 이메일 주소를 입력하세요.', '', 'warning');
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
                        Swal.fire('인증번호가 발송되었습니다.', '이메일을 확인하세요.', 'info');
                    } else {
                        Swal.fire('인증번호 발송에 실패했습니다.', '다시 시도해주세요.', 'error');
                    }
                },
                error: function(error) {
                    console.error('Error:', error);
                    Swal.fire('인증번호 발송 중 오류가 발생했습니다.', '', 'error');
                }
            });
        }
    });

    // 인증 코드 확인 버튼 클릭 시
    $('#verifyCodeBtn').on('click', function() {
        if (!isCodeSent) {
            Swal.fire('먼저 인증 코드를 발송해주세요.', '', 'warning');
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
                        Swal.fire('이메일 인증이 완료되었습니다.', '', 'success');
                        $('#verifyCodeBtn').text('인증 완료');
                        $('#verifyCodeBtn').css('background-color', 'green');
                        $('#verifyCodeBtn').css('border-color', 'green');
                        isEmailVerified = true; // 이메일 인증 여부 플래그 설정
                    } else {
                        Swal.fire('인증번호가 일치하지 않습니다.', '', 'error');
                    }
                },
                error: function(error) {
                    console.error('Error:', error);
                    Swal.fire('인증번호 확인 중 오류가 발생했습니다.', '', 'error');
                }
            });
        } else {
            Swal.fire('이메일과 인증번호를 입력해 주세요.', '', 'warning');
        }
    });

    $('#registerForm').on('submit', function(event) {
        event.preventDefault();

        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            Swal.fire('유효한 이메일 주소를 입력하세요.', '', 'warning');
            return;
        }

        var password = $('#password').val();
        var confirmPassword = $('#confirm_password').val();

        if (password !== confirmPassword) {
            Swal.fire('비밀번호가 일치하지 않습니다.', '', 'warning');
            return;
        }

        if (!$('#termsCheck1').is(':checked') || !$('#termsCheck2').is(':checked')) {
            Swal.fire('서비스 이용약관과 개인정보 처리방침에 동의해야 합니다.', '', 'warning');
            return;
        }

        if (!isEmailVerified) {
            Swal.fire('이메일 인증을 완료해 주세요.', '', 'warning');
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
                Swal.fire('회원가입이 완료되었습니다!', '', 'success').then(() => {
                    location.href = '/login';
                });
            },
            error: function(error) {
                console.error('Error:', error);
                Swal.fire('회원가입 중 오류가 발생했습니다.', '', 'error');
            }
        });
    });
});
