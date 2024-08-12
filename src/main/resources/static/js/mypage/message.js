$(document).ready(function() {
    var messageModal = new bootstrap.Modal(document.getElementById('messageModal'));

    function ajaxWithToken(url, options = {}) {
        options.headers = options.headers || {};
        options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
        return $.ajax(url, options);
    }

    function sendMessage() {
        Swal.fire({
            title: '쪽지 보내기',
            html:
                '<input id="receiver-email" class="swal2-input" placeholder="받는 사람 이메일">' +
                '<textarea id="message-content" class="swal2-textarea" placeholder="내용"></textarea>',
            focusConfirm: false,
            preConfirm: () => {
                return {
                    receiverEmail: document.getElementById('receiver-email').value,
                    content: document.getElementById('message-content').value
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                ajaxWithToken('/api/messages/send', {
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(result.value)
                })
                    .done(function(response) {
                        console.log('Message sent:', response);
                        Swal.fire('Success', 'Message sent successfully', 'success');
                        loadSentMessages();
                    })
                    .fail(function(error) {
                        console.error('Error sending message:', error);
                        Swal.fire('Error', 'Failed to send message', 'error');
                    });
            }
        });
    }

    function loadReceivedMessages() {
        ajaxWithToken('/api/messages/received')
            .done(function(messages) {
                displayMessages(messages, 'received');
            })
            .fail(function(error) {
                console.error('Error loading received messages:', error);
                Swal.fire('Error', 'Failed to load received messages', 'error');
            });
    }

    function loadSentMessages() {
        ajaxWithToken('/api/messages/sent')
            .done(function(messages) {
                displayMessages(messages, 'sent');
            })
            .fail(function(error) {
                console.error('Error loading sent messages:', error);
                Swal.fire('Error', 'Failed to load sent messages', 'error');
            });
    }

    function displayMessages(messages, type) {
        var messageList = type === 'received' ? $('#received-message-list') : $('#sent-message-list');
        messageList.empty();

        if (messages.length === 0) {
            messageList.append('<p>No messages to display.</p>');
            return;
        }

        messages.forEach(function(message) {
            var messageItem = $('<div class="message-item"></div>');
            messageItem.append('<p>From: ' + message.senderEmail + '</p>');
            messageItem.append('<p>To: ' + message.receiverEmail + '</p>');
            messageItem.append('<p>' + message.content.substring(0, 50) + '...</p>');
            messageItem.append('<p>Date: ' + new Date(message.createdDate).toLocaleString() + '</p>');

            var readButton = $('<button class="btn btn-sm btn-primary read-message">Read</button>');
            readButton.click(function() {
                readMessage(message.id, type);
            });

            var deleteButton = $('<button class="btn btn-sm btn-danger delete-message">Delete</button>');
            deleteButton.click(function() {
                deleteMessage(message.id, type);
            });

            messageItem.append(readButton);
            messageItem.append(deleteButton);
            messageList.append(messageItem);
        });
    }

    function readMessage(messageId, type) {
        var url = type === 'received' ? '/api/messages/received/read' : '/api/messages/sent/read';
        ajaxWithToken(url, {
            method: 'GET',
            data: { id: messageId }
        })
            .done(function(message) {
                Swal.fire({
                    title: 'Message',
                    html:
                        '<p>From: ' + message.senderEmail + '</p>' +
                        '<p>To: ' + message.receiverEmail + '</p>' +
                        '<p>' + message.content + '</p>' +
                        '<p>Date: ' + new Date(message.createdDate).toLocaleString() + '</p>',
                    showCloseButton: true
                });
            })
            .fail(function(error) {
                console.error('Error reading message:', error);
                Swal.fire('Error', 'Failed to read message', 'error');
            });
    }

    function deleteMessage(messageId, type) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                ajaxWithToken('/api/messages/delete', {
                    method: 'GET',
                    data: { id: messageId, box: type }
                })
                    .done(function(messages) {
                        Swal.fire('Deleted!', 'Your message has been deleted.', 'success');
                        if (type === 'received') {
                            loadReceivedMessages();
                        } else {
                            loadSentMessages();
                        }
                    })
                    .fail(function(error) {
                        console.error('Error deleting message:', error);
                        Swal.fire('Error', 'Failed to delete message', 'error');
                    });
            }
        });
    }

    // 쪽지함 버튼 클릭 이벤트
    $('#message-box').on('click', function() {
        loadReceivedMessages();
        messageModal.show();
    });

    // 새 쪽지 보내기 버튼 클릭 이벤트
    $('#new-message-btn').on('click', function() {
        sendMessage();
    });

    // 받은 쪽지 탭 클릭 이벤트
    $('#received-tab').on('click', function() {
        loadReceivedMessages();
    });

    // 보낸 쪽지 탭 클릭 이벤트
    $('#sent-tab').on('click', function() {
        loadSentMessages();
    });

    // 쪽지 보내기 버튼 클릭 이벤트 (프로필 카드의 버튼)
    $('#send-message').on('click', function() {
        sendMessage();
    });

    // 페이지 로드 시 받은 쪽지함을 기본으로 로드
    loadReceivedMessages();
});