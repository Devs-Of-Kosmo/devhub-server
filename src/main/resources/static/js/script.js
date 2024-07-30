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

    $('#inviteForm').on('submit', function(event) {
        event.preventDefault();

        if (!userEmail) {
            alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        const receiverEmail = $('#receiverEmail').val();
        const messageContent = $('#messageContent').val();
        const inviteUrl = $('#inviteUrl').val();

        fetch('/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accessToken
            },
            body: JSON.stringify({
                receiverEmail: receiverEmail,
                content: messageContent,
                inviteUrl: inviteUrl
            })
        })
            .then(response => response.json())
            .then(data => {
                alert('메시지가 성공적으로 전송되었습니다!');
                $('#inviteModal').modal('hide');
            })
            .catch(error => console.error('Error:', error));
    });

    function receiverLoadMessages() {
        if (!userEmail) {
            alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        fetch('/api/messages/received', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); // 응답 데이터 로그 출력

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format");
                }

                const messageList = $('#messageList');
                messageList.empty(); // 기존 목록 비우기

                data.forEach(MessageDtoResponse => {
                    // 메시지 리스트 항목
                    const receiverListItem = $('<li></li>').addClass('list-group-item')
                        .text(`보낸 사람: ${MessageDtoResponse.senderEmail}, 내용: ${MessageDtoResponse.content}, 보낸 시간: ${new Date(MessageDtoResponse.createdDate).toLocaleString()}`)
                        .append(
                            $('<input type="hidden">').addClass('message-id').val(MessageDtoResponse.id),
                            $('<input type="hidden">').addClass('message-box').val('receiver'),
                            $('<button></button>')
                                .addClass('btn btn-danger btn-sm')
                                .text('삭제')
                                .css({'border': '2px solid #dc3545'})
                                .on('click', function(event) {
                                    event.stopPropagation();

                                    const parentLi = $(this).closest('li');
                                    const messageId = parentLi.find('.message-id').val();
                                    const messageBox = parentLi.find('.message-box').val();

                                    // 값 로그 출력
                                    console.log("messageId:", messageId);
                                    console.log("messageBox:", messageBox);

                                    // Fetch를 사용하여 요청 보내기
                                    fetch(`/api/messages/delete?id=${messageId}&box=${messageBox}`, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': 'Bearer ' + accessToken
                                        }
                                    })
                                        .then(response => {
                                            if (response.ok) {
                                                return response.json();
                                            } else {
                                                throw new Error('Network response was not ok');
                                            }
                                        })
                                        .then(responseData => {
                                            alert('쪽지가 삭제 되었습니다.');
                                            // 리스트를 다시 로드
                                            receiverLoadMessages();
                                        })
                                        .catch(error => {
                                            alert('삭제 요청이 실패했습니다: ' + error);
                                        });
                                })
                        )
                        .on('click', function() {
                            // 클릭 시 메시지 상세정보 항목 생성 및 업데이트

                            const messageId = $(this).find('.message-id').val();
                            const messageBox = $(this).find('.message-box').val();

                            fetch(`/api/messages/received/read?id=${messageId}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + accessToken
                                }
                            })
                                .then(response => response.json())
                                .then(data => {
                                    $('#inviteModal').modal('hide');

                                    const receivedMessageItem = $('<li></li>').addClass('list-group-item')
                                        .append(
                                            $('<span></span>')
                                                .text(`보낸 사람: ${data.senderEmail}`)
                                                .css({'display': 'block', 'margin-top': '10px'}),
                                            $('<hr>'),
                                            /*$('<span></span>')
                                                .text(`팀 URL: ${data.teamUrl}`)
                                                .css('display', 'block'),*/
                                            $('<span></span>')
                                                .text(`팀 소개: ${data.content}`)
                                                .css('display', 'block'),
                                            $('<button></button>')
                                                .addClass('btn btn-primary btn-sm')
                                                .text('invite')
                                                .css({'border': '2px solid #000000', 'margin-top': '10px'})
                                                .on('click', function(event) {
                                                    window.location.href = data.teamUrl;
                                                }),
                                            $('<hr>'),
                                            $('<span></span>')
                                                .text(`보낸 날짜: ${new Date(data.createdDate).toLocaleString()}`)
                                                .css('display', 'block'),
                                            $('<hr>'),
                                            $('<button></button>')
                                                .addClass('btn btn-danger btn-sm')
                                                .text('삭제')
                                                .css({'border': '2px solid #dc3545'})
                                                .on('click', function(event) {
                                                    event.stopPropagation(); // 클릭 이벤트 전파 방지

                                                    fetch(`/api/messages/delete?id=${messageId}&box=${messageBox}`, {
                                                        method: 'GET',
                                                        headers: {
                                                            'Authorization': 'Bearer ' + accessToken
                                                        }
                                                    })
                                                        .then(response => {
                                                            if (response.ok) {
                                                                return response.json();
                                                            } else {
                                                                throw new Error('Network response was not ok');
                                                            }
                                                        })
                                                        .then(responseData => {
                                                            alert('쪽지가 삭제 되었습니다.');
                                                            // 리스트를 다시 로드
                                                            receiverLoadMessages();
                                                        })
                                                        .catch(error => {
                                                            alert('삭제 요청이 실패했습니다: ' + error);
                                                        });
                                                }),
                                            $('<button></button>')
                                                .addClass('btn btn-secondary btn-sm')
                                                .text('뒤로가기')
                                                .on('click', function() {
                                                    // 상세 정보를 비우고 목록을 다시 표시
                                                    messageList.empty();
                                                    receiverLoadMessages();
                                                })
                                        );

                                    // 기존 내용 제거 후 새로운 내용 추가
                                    messageList.empty(); // 기존 내용 삭제
                                    messageList.append(receivedMessageItem); // 새 내용 추가
                                })
                                .catch(error => console.error('Error:', error));
                        });

                    messageList.append(receiverListItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('메시지를 불러오는데 실패했습니다. 다시 시도해주세요.');
            });
    }

    function senderLoadMessages() {
        if (!userEmail) {
            alert('사용자 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        fetch('/api/messages/sent', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data); // 응답 데이터 로그 출력

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format");
                }

                const messageList = $('#messageList');
                messageList.empty(); // 기존 목록 비우기

                data.forEach(MessageDtoResponse => {
                    // 메시지 리스트 항목
                    const senderListItem = $('<li></li>').addClass('list-group-item')
                        .text(`받은 사람: ${MessageDtoResponse.receiverEmail}, 내용: ${MessageDtoResponse.content}, 보낸 시간: ${new Date(MessageDtoResponse.createdDate).toLocaleString()}`)
                        .append(
                            $('<input type="hidden">').addClass('message-id').val(MessageDtoResponse.id),
                            $('<input type="hidden">').addClass('message-box').val('sender'),
                            $('<button></button>')
                                .addClass('btn btn-danger btn-sm')
                                .text('삭제')
                                .css({'border': '2px solid #dc3545'})
                                .on('click', function(event) {
                                    event.stopPropagation();

                                    const parentLi = $(this).closest('li');
                                    const messageId = parentLi.find('.message-id').val();
                                    const messageBox = parentLi.find('.message-box').val();

                                    // 값 로그 출력
                                    console.log("messageId:", messageId);
                                    console.log("messageBox:", messageBox);

                                    // Fetch를 사용하여 요청 보내기
                                    fetch(`/api/messages/delete?id=${messageId}&box=${messageBox}`, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': 'Bearer ' + accessToken
                                        }
                                    })
                                        .then(response => {
                                            if (response.ok) {
                                                return response.json();
                                            } else {
                                                throw new Error('Network response was not ok');
                                            }
                                        })
                                        .then(responseData => {
                                            alert('쪽지가 삭제 되었습니다.');
                                            // 리스트를 다시 로드
                                            senderLoadMessages();
                                        })
                                        .catch(error => {
                                            alert('삭제 요청이 실패했습니다: ' + error);
                                        });
                                })
                        )
                        .on('click', function() {
                            // 클릭 시 메시지 상세정보 항목 생성

                            const messageId = $(this).find('.message-id').val();
                            const messageBox = $(this).find('.message-box').val();

                            fetch(`/api/messages/sent/read?id=${messageId}`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Bearer ' + accessToken
                                }
                            })
                                .then(response => response.json())
                                .then(data => {
                                    $('#inviteModal').modal('hide');

                                    const sentMessageItem = $('<li></li>').addClass('list-group-item')
                                        .append(
                                            $('<span></span>')
                                                .text(`받은 사람: ${data.receiverEmail}`)
                                                .css('display', 'block'),
                                            $('<span></span>')
                                                .text(`팀 URL: ${data.teamUrl}`)
                                                .css('display', 'block'),
                                            $('<span></span>')
                                                .text(`보낸 날짜: ${new Date(data.createdDate).toLocaleString()}`)
                                                .css('display', 'block'),
                                            $('<button></button>')
                                                .addClass('btn btn-danger btn-sm')
                                                .text('삭제')
                                                .css({'border': '2px solid #dc3545'})
                                                .on('click', function(event) {
                                                    event.stopPropagation(); // 클릭 이벤트 전파 방지

                                                    // Fetch를 사용하여 요청 보내기
                                                    fetch(`/api/messages/delete?id=${messageId}&box=${messageBox}`, {
                                                        method: 'GET',
                                                        headers: {
                                                            'Authorization': 'Bearer ' + accessToken
                                                        }
                                                    })
                                                        .then(response => {
                                                            if (response.ok) {
                                                                return response.json();
                                                            } else {
                                                                throw new Error('Network response was not ok');
                                                            }
                                                        })
                                                        .then(responseData => {
                                                            alert('쪽지가 삭제 되었습니다.');
                                                            // 리스트를 다시 로드
                                                            senderLoadMessages();
                                                        })
                                                        .catch(error => {
                                                            alert('삭제 요청이 실패했습니다: ' + error);
                                                        });
                                                }),
                                            $('<button></button>')
                                                .addClass('btn btn-secondary btn-sm')
                                                .text('뒤로가기')
                                                .on('click', function() {
                                                    // 상세 정보를 비우고 목록을 다시 표시
                                                    messageList.empty();
                                                    senderLoadMessages();
                                                })
                                        );

                                    // 기존 내용 제거 후 새로운 내용 추가
                                    messageList.empty(); // 기존 내용 삭제
                                    messageList.append(sentMessageItem); // 새 내용 추가
                                })
                                .catch(error => console.error('Error:', error));
                        });

                    messageList.append(senderListItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('메시지를 불러오는데 실패했습니다. 다시 시도해주세요.');
            });
    }

    $('#receivedTab').on('click', function() {
        receiverLoadMessages();
    });

    $('#sentTab').on('click', function() {
        senderLoadMessages();
    });

    $('#messageModal').on('show.bs.modal', receiverLoadMessages);

    var token = localStorage.getItem('accessToken');
                console.log('Token from localStorage:', token);  // 토큰을 콘솔에 출력하여 확인
                if (token) {
                    var myProjectsLink = document.getElementById('my-projects-link');
                    myProjectsLink.href = 'http://127.0.0.1:5000/?token=' + token;
                }
});