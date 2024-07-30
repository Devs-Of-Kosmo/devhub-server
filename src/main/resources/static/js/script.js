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
                //로그아웃 기능
                document.getElementById('log-out').addEventListener('click', function() {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('projects');

                    alert('로그아웃 되었습니다.');
                    window.location.href = '/';
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