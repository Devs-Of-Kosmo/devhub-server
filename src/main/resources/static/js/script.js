import connectWebSocket from './websocket.js';

$(document).ready(function() {
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

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
                var myProjectsLink = document.getElementById('my-projects-link');
                var projectLink = document.getElementById('project-link');
                var soloSideLink = document.getElementById('solo_side');
                var teamSideLink = document.querySelector('.offcanvas-body nav ul li:nth-child(6) a');

                if (myProjectsLink) {
                    myProjectsLink.href = 'loading';
                }

                if (projectLink) {
                    projectLink.href = 'http://127.0.0.1:5000/?token=' + accessToken;
                }

                if (soloSideLink) {
                    soloSideLink.href = 'loading';
                }

                if (teamSideLink) {
                    teamSideLink.href = 'teamloading';
                }

                // 로그아웃 요청 보내기 - JavaScript
                document.getElementById('log-out').addEventListener('click', function() {
                    // localStorage에서 토큰 제거
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('projects');

                    // 서버에 로그아웃 요청 보내기
                    fetch('/api/auth/logout', {
                        method: 'GET',
                        credentials: 'same-origin', // 인증된 요청을 보낼 때 필요
                        headers: {
                            'Authorization': 'Bearer ' + accessToken // 여기에 토큰을 포함해야 할 수도 있습니다.
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
        var myProjectsLink = document.getElementById('my-projects-link');
        var projectLink = document.getElementById('project-link');
        var soloSideLink = document.getElementById('solo_side');
        var teamSideLink = document.querySelector('.offcanvas-body nav ul li:nth-child(6) a');

        if (myProjectsLink) {
            myProjectsLink.href = '#';
            myProjectsLink.addEventListener('click', function(event) {
                event.preventDefault();
                Swal.fire('로그인이 필요합니다.', '', 'warning').then(() => {
                    window.location.href = 'login';
                });
            });
        }

        if (projectLink) {
            projectLink.href = '#';
            projectLink.addEventListener('click', function(event) {
                event.preventDefault();
                Swal.fire('로그인이 필요합니다.', '', 'warning').then(() => {
                    window.location.href = 'login';
                });
            });
        }

        if (soloSideLink) {
            soloSideLink.href = '#';
            soloSideLink.addEventListener('click', function(event) {
                event.preventDefault();
                Swal.fire('로그인이 필요합니다.', '', 'warning').then(() => {
                    window.location.href = 'login';
                });
            });
        }

        if (teamSideLink) {
            teamSideLink.href = '#';
            teamSideLink.addEventListener('click', function(event) {
                event.preventDefault();
                Swal.fire('로그인이 필요합니다.', '', 'warning').then(() => {
                    window.location.href = 'login';
                });
            });
        }
    }
});
