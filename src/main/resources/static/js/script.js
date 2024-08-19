import connectWebSocket from './websocket.js';

$(document).ready(function() {
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

    $('#login-link').attr('href', 'login');
    $('#login-side').attr('href', 'login');

    function handleUnauthenticatedClick(event) {
        event.preventDefault();
        Swal.fire('로그인이 필요합니다.', '', 'warning').then(() => {
            window.location.href = 'login';
        });
    }

    if (accessToken) {
        $.ajax({
            type: 'GET',
            url: '/api/user/info',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                var userName = response.name;
                userEmail = response.email;

                var socketEmail = userEmail;
                connectWebSocket(socketEmail);

                // 로그인된 경우 UI 변경
                document.getElementById('login-container').style.cssText = 'display: none !important;';
                $('#login-link').text(userName + '님').attr('href', '/mypage');
                $('#login-side').text(userName + '님').attr('href', '/mypage');

                // 회원가입 링크 제거
                var registerLink = document.querySelector('a[href="register"]');
                if (registerLink) {
                    registerLink.style.display = 'none';
                }

                // 로그인된 경우 링크를 활성화
                $('a[href="#"]').each(function() {
                    var $link = $(this);
                    if ($link.text() === '나의 프로젝트') {
                        $link.attr('href', 'loading');
                    } else if ($link.text() === '팀 프로젝트') {
                        $link.attr('href', '/team_project');
                    }
                    $link.off('click', handleUnauthenticatedClick);
                });

                // 로그아웃 요청 보내기
                document.getElementById('log-out').addEventListener('click', function() {
                    // localStorage에서 토큰 제거
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('projects');

                    // 서버에 로그아웃 요청 보내기
                    fetch('/api/auth/logout', {
                        method: 'GET',
                        credentials: 'same-origin',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken
                        }
                    })
                        .then(response => {
                            if (response.ok) {
                                Swal.fire({
                                    title: '로그아웃 되었습니다.',
                                    icon: 'success',
                                    confirmButtonText: '확인'
                                }).then(() => {
                                    window.location.href = '/';
                                });
                            } else {
                                Swal.fire('로그아웃에 실패했습니다.', '', 'error');
                            }
                        })
                        .catch(error => {
                            console.error('로그아웃 요청 중 오류 발생:', error);
                            Swal.fire('로그아웃 중 오류가 발생했습니다.', '', 'error');
                        });
                });
            },
            error: function(error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        });
    } else {
        $('#login-link').attr('href', 'login');

        // 로그인되지 않은 경우 링크를 비활성화
        $('a[href="#"]').each(function() {
            var $link = $(this);
            if ($link.text() === '나의 프로젝트' || $link.text() === '팀 프로젝트') {
                $link.on('click', handleUnauthenticatedClick);
            }
        });
    }
});