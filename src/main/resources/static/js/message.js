$(document).ready(function() {
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

    const messageSendLink = document.getElementById('message-send');
    const messageBoxLink = document.getElementById('message-box');

    function updateMessageLinksVisibility() {
        if (userEmail != null) {
            messageSendLink.style.display = 'block';
            messageBoxLink.style.display = 'block';
            console.log("Message links are now visible."); // 확인용 로그
        } else {
            messageSendLink.style.display = 'none';
            messageBoxLink.style.display = 'none';
            console.log("Message links are now hidden."); // 확인용 로그
        }
    }

    window.updateMessageCount = function(data) {
        var messageBox = document.getElementById('message-box');
        if (data != "0") {
            messageBox.style.backgroundImage = 'url("css/images/message-alert.png")';
            messageBox.style.backgroundRepeat = 'no-repeat';
            messageBox.style.backgroundPosition = 'center center';
        } else {
            messageBox.style.backgroundImage = 'url("css/images/message.png")';
            messageBox.style.backgroundRepeat = 'no-repeat';
            messageBox.style.backgroundPosition = 'center center';
        }
    };

    if (accessToken) {
        $.ajax({
            type: 'GET',
            url: '/api/user/info',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            success: function(response) {
                userEmail = response.email;
                updateMessageLinksVisibility();
            },
            error: function(xhr, status, error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', status, error);
                updateMessageLinksVisibility();
            }
        });
    } else {
        updateMessageLinksVisibility();
    }

    $('#inviteForm').on('submit', function(event) {
        event.preventDefault();

        const receiverEmail = $('#receiverEmail').val();
        const messageContent = $('#messageContent').val();
        let messageStrCount = messageContent.length;

        if(messageStrCount <= 300){
            fetch('/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accessToken
                },
                body: JSON.stringify({
                    receiverEmail: receiverEmail,
                    content: messageContent
                })
            })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(errorData => {
                            Swal.fire('실패', '받는 사람의 이메일이 존재하지 않습니다.', 'error');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data) {
                        Swal.fire('성공', '메시지가 성공적으로 전송되었습니다!', 'success');
                        $('#inviteModal').modal('hide');
                    } else {
                        Swal.fire('실패', '메시지 전송에 실패했습니다.', 'error');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire('실패', '메시지 전송 중 오류가 발생했습니다.', 'error');
                });
        } else {
            Swal.fire('실패', `300자 이내로 작성해주세요. (${messageStrCount}/300)`, 'error');
        }
    });

    function deleteMessage(messageId, messageBox, url, messageType) {
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
                Swal.fire('성공', '쪽지가 삭제 되었습니다.', 'success');
                loadMessages(url, messageType);
            })
            .catch(error => {
                Swal.fire('실패', '삭제 요청이 실패했습니다: ' + error, 'error');
            });
    }

    function loadMessages(url, messageType) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);

                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format");
                }

                const messageList = $('#messageList');
                messageList.empty();

                data.forEach(message => {
                    let listItem;
                    if(messageType === 'received' && message.readCondition == true) {
                        listItem = $('<li></li>').addClass('list-group-item').css({'padding': '8px 20px', 'background-color': '#ededed', 'box-shadow' : 'inset 0 0 5px rgba(0, 0, 0, 0.5)'});
                    } else {
                        listItem = $('<li></li>').addClass('list-group-item').css('padding', '8px 20px');
                    }

                    let messageTitle = message.content.substring(0, 20);
                    let messageHtml = message.content.replace(/\n/g, "<br>");

                    listItem.append(
                        $('<div></div>').text(
                            messageType === 'received' ? `보낸 사람: ${message.senderEmail}` : `받는 사람: ${message.receiverEmail}`
                        ).css('font-size', 'small'),
                        $('<div></div>').text(`팀 소개: ${messageTitle}...`).css('font-size', 'small'),
                        $('<div></div>').css({'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center'}).append(
                            $('<span></span>').text(`보낸 시간: ${new Date(message.createdDate).toLocaleString()}`).css('font-size', 'small'),
                            $('<button></button>').addClass('btn btn-danger btn-sm').text('삭제').css({'font-size': 'small', 'border': '2px solid #ff6161', 'background-color': '#ff6161','padding' : '0px 3px', 'margin-right' : '5px'}).on('click', function(event) {
                                event.stopPropagation();
                                const parentLi = $(this).closest('li');
                                const messageId = parentLi.find('.message-id').val();
                                const messageBox = parentLi.find('.message-box').val();
                                deleteMessage(messageId, messageBox, url, messageType);
                            })
                        ),
                        $('<input type="hidden">').addClass('message-id').val(message.id),
                        $('<input type="hidden">').addClass('message-box').val(messageType)
                    ).on('click', function() {
                        const messageId = $(this).find('.message-id').val();
                        const messageBox = $(this).find('.message-box').val();
                        fetch(`/api/messages/${messageBox}/read?id=${messageId}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': 'Bearer ' + accessToken
                            }
                        })
                            .then(response => response.json())
                            .then(data => {
                                $('#inviteModal').modal('hide');

                                const messageItem = $('<li></li>').addClass('list-group-item').append(
                                    $('<div></div>').css({'display': 'flex', 'align-items': 'center'}).append(
                                        $('<button></button>').addClass('btn btn-secondary btn-sm').text('<').on('click', function() {
                                            messageList.empty();
                                            loadMessages(url, messageType);
                                        }),
                                        $('<div></div>').text(
                                            messageType === 'received' ? `보낸 사람: ${message.senderEmail}` : `받는 사람: ${message.receiverEmail}`
                                        ).css({'margin-left': '10px'})
                                    ),
                                    $('<hr>').css('margin-top','3px'),
                                    $('<span></span>').html(`${messageHtml}`).css({'display': 'block', 'text-align' : 'center'}),
                                    $('<hr>').css('margin-bottom','5px'),
                                    $('<div></div>').css({'display': 'flex', 'justify-content': 'space-between', 'align-items': 'center'}).append(
                                        $('<span></span>').text(`보낸 날짜 : ${new Date(message.createdDate).toLocaleString()}`).css('margin-left','5px'),
                                        $('<button></button>').addClass('btn btn-danger btn-sm').text('삭제').css({'border': '2px solid #ff6161', 'background-color': '#ff6161','padding' : '3px 6px', 'margin-right' : '5px'}).on('click', function(event) {
                                            event.stopPropagation();
                                            deleteMessage(messageId, messageBox, url, messageType);
                                        })
                                    ),
                                    $('<hr>').css('margin-top','5px')
                                );

                                messageList.empty();
                                messageList.append(messageItem);
                            })
                            .catch(error => console.error('Error:', error));
                    });

                    messageList.append(listItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire('실패', '메시지를 불러오는데 실패했습니다. 다시 시도해주세요.', 'error');
            });
    }

    $('#receivedTab').on('click', function() {
        loadMessages('/api/messages/received', 'received');
    });

    $('#sentTab').on('click', function() {
        loadMessages('/api/messages/sent', 'sent');
    });

    $('#messageModal').on('show.bs.modal', function() {
        loadMessages('/api/messages/received', 'received');
    });
});
