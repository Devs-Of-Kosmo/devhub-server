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
                userName = response.name;
                userEmail = response.email;

                document.getElementById('login-container').style.cssText = 'display: none !important;';
                $('#login-link').text(userName + '님');
                $('#login-side').text(userName + '님')

                $('#login-link').on('click', function() {
                    $('#profileName').val(userName);
                    $('#profileEmail').val(userEmail);
                    $('#profileModal').modal('show');
                });

                // 로그인된 경우 링크를 활성화
                var myProjectsLink = document.getElementById('my-projects-link');
                var projectLink = document.getElementById('project-link');

                if (myProjectsLink) {
                    myProjectsLink.href = 'loading';
                }

                if (projectLink) {
                    projectLink.href = 'http://192.168.0.158:5000/?token=' + accessToken;
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
                                alert('로그아웃 되었습니다.');
                                window.location.href = '/';
                            } else {
                                alert('로그아웃에 실패했습니다.');
                            }
                        })
                        .catch(error => {
                            console.error('로그아웃 요청 중 오류 발생:', error);
                            alert('로그아웃 중 오류가 발생했습니다.');
                        });
                });


                // 웹소켓 연결 설정
                var socket = new WebSocket("ws://localhost:8080/ws/message?email=" + userEmail);

                // 웹소켓 이벤트 리스너 정의
                socket.onopen = function(event) {
                    console.log("웹소켓 연결이 열렸습니다.");
                };

                socket.onmessage = function(event) {
                    console.log("서버로부터 메시지 수신:", event.data);
                    $('#message-link').text(event.data);
                };

                socket.onclose = function(event) {
                    if (event.wasClean) {
                        console.log(`웹소켓 연결이 정상적으로 닫혔습니다. 코드: ${event.code}, 이유: ${event.reason}`);
                    } else {
                        console.error(`웹소켓 연결이 비정상적으로 닫혔습니다.`);
                    }
                };

                socket.onerror = function(error) {
                    console.error("웹소켓 에러 발생:", error);
                };
            },
            error: function(error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        });
    } else {
        // 로그인되지 않은 경우 링크를 비활성화
        var myProjectsLink = document.getElementById('my-projects-link');
        var projectLink = document.getElementById('project-link');

        if (myProjectsLink) {
            myProjectsLink.href = '#';
            myProjectsLink.addEventListener('click', function(event) {
                event.preventDefault();
                alert('로그인이 필요합니다.');
            });
        }

        if (projectLink) {
            projectLink.href = '#';
            projectLink.addEventListener('click', function(event) {
                event.preventDefault();
                alert('로그인이 필요합니다.');
            });
        }
    }
});