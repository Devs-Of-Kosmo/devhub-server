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
                let messageContent = result.value.content;
                let messageStrCount = messageContent.length;

                if (messageStrCount <= 300) {
                    ajaxWithToken('/api/messages/send', {
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(result.value)
                    })
                        .done(function(data, textStatus, jqXHR) {
                            if (jqXHR.status >= 200 && jqXHR.status < 300) {
                                console.log('메시지가 성공적으로 보내졌습니다:', data);
                                Swal.fire('성공', '메시지가 성공적으로 보내졌습니다.', 'success');
                                loadSentMessages();
                            } else {
                                console.error('메시지 보내기에 실패했습니다:', textStatus, data);
                                Swal.fire('오류', '메시지를 보내는 데 실패했습니다: ' + (data.message || '알 수 없는 오류'), 'error');
                            }
                        })
                        .fail(function(jqXHR, textStatus, errorThrown) {
                            console.error('메시지 보내기에 실패했습니다:', textStatus, errorThrown);
                            Swal.fire('오류', '메시지를 보내는 데 실패했습니다: ' + (jqXHR.responseJSON?.message || errorThrown), 'error');
                        });
                } else {
                    Swal.fire('오류', '300자 이내로 작성해주세요. ' + messageStrCount + '/300', 'error');
                }
            }
        });
    }

    function loadReceivedMessages() {
        ajaxWithToken('/api/messages/received')
            .done(function(messages, textStatus, jqXHR) {
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    displayMessages(messages, 'received', '-activity');
                    displayMessages(messages, 'received', '');
                } else {
                    console.error('받은 메시지를 불러오는 데 실패했습니다:', textStatus, messages);
                    Swal.fire('오류', '받은 메시지를 불러오는 데 실패했습니다: ' + (messages.message || '알 수 없는 오류'), 'error');
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('받은 메시지를 불러오는 데 실패했습니다:', textStatus, errorThrown);
                Swal.fire('오류', '받은 메시지를 불러오는 데 실패했습니다: ' + (jqXHR.responseJSON?.message || errorThrown), 'error');
            });
    }

    function loadSentMessages() {
        ajaxWithToken('/api/messages/sent')
            .done(function(messages, textStatus, jqXHR) {
                if (jqXHR.status >= 200 && jqXHR.status < 300) {
                    displayMessages(messages, 'sent', '-activity');
                    displayMessages(messages, 'sent', '');
                } else {
                    console.error('보낸 메시지를 불러오는 데 실패했습니다:', textStatus, messages);
                    Swal.fire('오류', '보낸 메시지를 불러오는 데 실패했습니다: ' + (messages.message || '알 수 없는 오류'), 'error');
                }
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('보낸 메시지를 불러오는 데 실패했습니다:', textStatus, errorThrown);
                Swal.fire('오류', '보낸 메시지를 불러오는 데 실패했습니다: ' + (jqXHR.responseJSON?.message || errorThrown), 'error');
            });
    }

    function displayMessages(messages, type, suffix) {
        var messageList = $('#' + type + '-message-list' + suffix);
        messageList.empty();

        if (messages.length === 0) {
            messageList.append('<p>표시할 메시지가 없습니다.</p>');
            return;
        }

        messages.forEach(function(message) {
            var messageItem = $('<div class="message-item"></div>');

            var clickableEmail = type === 'received' ? message.senderEmail : message.receiverEmail;
            var clickableLabel = type === 'received' ? '보낸 사람: ' : '받는 사람: ';

            var emailLink = $('<a href="#" class="email-link">' + clickableEmail + '</a>');
            emailLink.click(function(e) {
                e.preventDefault();
                $(this).closest('.message-item').find('.message-details').toggle();
            });

            messageItem.append($('<p>' + clickableLabel + '</p>').append(emailLink));

            var messageTitle = message.content.substring(0, 20) + '...';
            messageItem.append($('<p>팀 소개: ' + messageTitle + '</p>').css('font-size', 'small'));

            var messageDetails = $('<div class="message-details" style="display: none;"></div>');
            if (type === 'received') {
                messageDetails.append('<p>받는 사람: ' + message.receiverEmail + '</p>');
            } else {
                messageDetails.append('<p>보낸 사람: ' + message.senderEmail + '</p>');
            }
            messageDetails.append('<p>내용: ' + message.content.replace(/\n/g, "<br>") + '</p>');
            messageDetails.append('<p>날짜: ' + new Date(message.createdDate).toLocaleString() + '</p>');

            messageItem.append(messageDetails);

            var deleteButton = $('<button class="btn btn-sm btn-danger delete-message">삭제</button>');
            deleteButton.click(function() {
                deleteMessage(message.id, type);
            });

            messageItem.append(deleteButton);
            messageList.append(messageItem);
        });
    }

    function deleteMessage(messageId, type) {
        Swal.fire({
            title: '정말 삭제하시겠습니까?',
            text: "삭제 후 복구할 수 없습니다!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: '네, 삭제합니다!'
        }).then((result) => {
            if (result.isConfirmed) {
                ajaxWithToken('/api/messages/delete', {
                    method: 'GET',
                    data: { id: messageId, box: type }
                })
                    .done(function(data, textStatus, jqXHR) {
                        if (jqXHR.status >= 200 && jqXHR.status < 300) {
                            Swal.fire('삭제됨', '메시지가 삭제되었습니다.', 'success');
                            if (type === 'received') {
                                loadReceivedMessages();
                            } else {
                                loadSentMessages();
                            }
                        } else {
                            console.error('메시지 삭제에 실패했습니다:', textStatus, data);
                            Swal.fire('오류', '메시지 삭제에 실패했습니다: ' + (data.message || '알 수 없는 오류'), 'error');
                        }
                    })
                    .fail(function(jqXHR, textStatus, errorThrown) {
                        console.error('메시지 삭제에 실패했습니다:', textStatus, errorThrown);
                        Swal.fire('오류', '메시지 삭제에 실패했습니다: ' + (jqXHR.responseJSON?.message || errorThrown), 'error');
                    });
            }
        });
    }

    $('#message-box').on('click', function() {
        loadReceivedMessages();
        messageModal.show();
    });

    $('#new-message-btn').on('click', function() {
        sendMessage();
    });

    $('#received-tab').on('click', function() {
        loadReceivedMessages();
    });

    $('#sent-tab').on('click', function() {
        loadSentMessages();
    });

    $('#send-message').on('click', function() {
        sendMessage();
    });

    $('#pills-received-tab-activity').on('click', function() {
        loadReceivedMessages();
    });

    $('#pills-sent-tab-activity').on('click', function() {
        loadSentMessages();
    });

    // 초기 로드
    loadReceivedMessages();

    $('head').append('<style>' +
        '.email-link { text-decoration: underline; cursor: pointer; color: #FFFFFF; }' +
        '.message-item { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; }' +
        '.message-details { margin-top: 10px; }' +
        '</style>');
});