$(document).ready(function () {
    let sentToEmail = '';
    let isCodeSent = false;
    let isEmailVerified = false;

    function checkPreVerifiedEmail() {
        const hideEmailElement = document.getElementById('emailElement');
        const hideNameElement = document.getElementById('nameElement');
        const email = hideEmailElement ? hideEmailElement.getAttribute('data-email') : null;
        const name = hideNameElement ? hideNameElement.getAttribute('data-name') : null;

        if (email && name) {
            isEmailVerified = true;
            $('#name').val(name);
            $('#email').val(email);
            setEmailFieldReadOnly();
            $('#verificationCodeSection').hide();
            $('#emailVerifiedMessage').show();
            $('#emailVerifyBtn').hide();
        }
    }

    function setEmailFieldReadOnly() {
        $('#email').prop('readonly', true);
        $('#email').css('background-color', '#e9ecef');
        $('#email').css('cursor', 'not-allowed');
    }

    checkPreVerifiedEmail();

    $('.agree-btn').on('click', function() {
        var checkId = $(this).data('check');
        $('#' + checkId).prop('checked', true);
        $('.modal').modal('hide');
    });

    $('#flexCheckAll').on('change', function() {
        var isChecked = $(this).is(':checked');
        $('input[type="checkbox"]').prop('checked', isChecked);
    });

    $('#emailVerifyBtn').on('click', function() {
        var email = $('#email').val();
        var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailPattern.test(email)) {
            Swal.fire('유효한 이메일 주소를 입력하세요.', '', 'warning');
        } else {
            $.ajax({
                type: 'POST',
                url: '/api/mail/public/send',
                data: JSON.stringify({ email: email }),
                contentType: 'application/json',
                success: function(response) {
                    if (response.toEmail) {
                        sentToEmail = response.toEmail;
                        isCodeSent = true;
                        $('#verifyCodeBtn').text('인증 코드 확인');
                        $('#verifyCodeBtn').prop('disabled', false);
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
                        $('#verifyCodeBtn').prop('disabled', true);
                        $('#verifyCodeBtn').css('background-color', 'green');
                        $('#verifyCodeBtn').css('border-color', 'green');
                        isEmailVerified = true;
                        setEmailFieldReadOnly();
                        $('#emailVerifiedMessage').show();
                        $('#emailVerifyBtn').hide();
                        $('#verificationCodeSection').hide();
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