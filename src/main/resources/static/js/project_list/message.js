$(document).ready(function() {
    var accessToken = localStorage.getItem('accessToken');
    var userEmail = null;

    const messageSendLink = document.getElementById('message-send');
    const messageBoxLink = document.getElementById('message-box');

    // Bootstrap 모달 초기화
    var sendMessageModal = new bootstrap.Modal(document.getElementById('sendMessageModal'));
    var messageModal = new bootstrap.Modal(document.getElementById('messageModal'));

    // 쪽지 보내기 모달 열기
    messageSendLink.addEventListener('click', function(e) {
        e.preventDefault();
        sendMessageModal.show();
    });

    // 쪽지함 모달 열기
    messageBoxLink.addEventListener('click', function(e) {
        e.preventDefault();
        messageModal.show();
    });

    window.updateMessageCount = function(data) {
        var messageBox = document.getElementById('message-box');
        if (data != "0") {
            messageBox.innerText = "쪽지함(" + data + ")";
        } else {
            messageBox.innerText = "쪽지함";
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
            },
            error: function(xhr, status, error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', status, error);
            }
        });
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
                            throw new Error(errorData.message || '쪽지 전송에 실패했습니다.');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    Swal.fire({
                        title: '성공',
                        text: '메시지가 성공적으로 전송되었습니다!',
                        icon: 'success',
                        confirmButtonText: '확인'
                    }).then(() => {
                        $('#inviteForm')[0].reset(); // 폼 초기화
                        sendMessageModal.hide(); // 모달 닫기
                    });
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        title: '오류',
                        text: error.message || '메시지 전송에 실패했습니다.',
                        icon: 'error',
                        confirmButtonText: '확인'
                    });
                });
        } else {
            alert("300자 이내로 작성해주세요." + messageStrCount +"/300");
        }
    });

    function loadMessages(url, messageType) {
        fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data)) {
                    throw new Error("Invalid response format");
                }

                const messageList = $(`#${messageType}List`);
                messageList.empty();

                data.forEach(message => {
                    let listItem = $('<li></li>').addClass('list-group-item').css('padding', '8px 20px');
                    if (messageType === 'received' && message.readCondition === true) {
                        listItem.css({
                            'background-color': '#ededed',
                            'box-shadow': 'inset 0 0 5px rgba(0, 0, 0, 0.5)'
                        });
                    }

                    let messageTitle = message.content.substring(0, 20);
                    let messageHtml = message.content.replace(/\n/g, "<br>");

                    listItem.append(
                        $('<div></div>').text(`${messageType === 'received' ? '보낸 사람' : '받는 사람'}: ${messageType === 'received' ? message.senderEmail : message.receiverEmail}`).css('font-size', 'small'),
                        $('<div></div>').text(`내용: ${messageTitle}...`).css('font-size', 'small'),
                        $('<div></div>').css({
                            'display': 'flex',
                            'justify-content': 'space-between',
                            'align-items': 'center'
                        }).append(
                            $('<span></span>').text(`보낸 시간: ${new Date(message.createdDate).toLocaleString()}`).css('font-size', 'small'),
                            $('<button></button>').addClass('btn btn-danger btn-sm delete-btn').text('삭제').css({
                                'font-size': 'small',
                                'border': '2px solid #ff6161',
                                'background-color': '#ff6161',
                                'padding': '0px 3px',
                                'margin-right': '5px'
                            })
                        ),
                        $('<input type="hidden">').addClass('message-id').val(message.id),
                        $('<input type="hidden">').addClass('message-box').val(messageType)
                    );

                    listItem.on('click', function(e) {
                        if (!$(e.target).hasClass('delete-btn')) {
                            const messageId = $(this).find('.message-id').val();
                            const messageBox = $(this).find('.message-box').val();
                            showMessageDetails(message, messageId, messageBox, messageType);
                        }
                    });

                    messageList.append(listItem);
                });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('메시지를 불러오는데 실패했습니다. 다시 시도해주세요.');
            });
    }

    function showMessageDetails(message, messageId, messageBox, messageType) {
        const messageItem = $('<li></li>').addClass('list-group-item').append(
            $('<div></div>').css({
                'display': 'flex',
                'align-items': 'center'
            }).append(
                $('<button></button>').addClass('btn btn-secondary btn-sm back-btn').text('<').on('click', function() {
                    loadMessages(messageType === 'received' ? '/api/messages/received' : '/api/messages/sent', messageType);
                }),
                $('<span></span>').text(`${messageType === 'received' ? '보낸 사람' : '받는 사람'}: ${messageType === 'received' ? message.senderEmail : message.receiverEmail}`).css('margin-left', '10px')
            ),
            $('<hr>').css('margin-top', '3px'),
            $('<span></span>').html(`${message.content.replace(/\n/g, "<br>")}`).css({
                'display': 'block',
                'text-align': 'center'
            }),
            $('<hr>').css('margin-bottom', '5px'),
            $('<div></div>').css({
                'display': 'flex',
                'justify-content': 'space-between',
                'align-items': 'center'
            }).append(
                $('<span></span>').text(`보낸 날짜 : ${new Date(message.createdDate).toLocaleString()}`).css('margin-left', '5px'),
                $('<button></button>').addClass('btn btn-danger btn-sm delete-btn').text('삭제').css({
                    'border': '2px solid #ff6161',
                    'background-color': '#ff6161',
                    'padding': '3px 6px',
                    'margin-right': '5px'
                })
            ),
            $('<hr>').css('margin-top', '5px')
        );

        $(`#${messageType}List`).empty().append(messageItem);

        if (messageType === 'received') {
            fetch(`/api/messages/${messageBox}/read?id=${messageId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            })
                .then(response => response.json())
                .catch(error => console.error('Error:', error));
        }
    }

    $(document).on('click', '.delete-btn', function(event) {
        event.stopPropagation();
        const messageId = $(this).closest('li').find('.message-id').val();
        const messageBox = $(this).closest('li').find('.message-box').val();

        Swal.fire({
            title: '정말로 이 쪽지를 삭제하시겠습니까?',
            text: "이 작업은 취소할 수 없습니다!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '삭제',
            cancelButtonText: '취소'
        }).then((result) => {
            if (result.isConfirmed) {
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
                        Swal.fire('삭제됨!', '쪽지가 삭제되었습니다.', 'success');
                        loadMessages(messageBox === 'received' ? '/api/messages/received' : '/api/messages/sent', messageBox);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire('오류', '쪽지 삭제 중 오류가 발생했습니다.', 'error');
                    });
            }
        });
    });

    $('#receivedTab').on('click', function() {
        loadMessages('/api/messages/received', 'received');
    });

    $('#sentTab').on('click', function() {
        loadMessages('/api/messages/sent', 'sent');
    });

    $('#messageModal').on('show.bs.modal', function() {
        loadMessages('/api/messages/received', 'received');
    });

    // 모달 닫기 버튼에 이벤트 리스너 추가
    $('.modal .close, .modal .btn-close').on('click', function() {
        $(this).closest('.modal').modal('hide');
    });

    window.closeModal = function(modalId) {
        if (modalId === 'sendMessageModal') {
            sendMessageModal.hide();
        } else if (modalId === 'messageModal') {
            messageModal.hide();
        }
    };
});