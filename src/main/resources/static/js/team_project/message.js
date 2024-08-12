let currentState = 'initial';
let inviteEmail = '';

function ajaxWithToken(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
    return $.ajax(url, options);
}

function responsiveChat(element) {
    $(element).html('<form class="chat"><span></span><div class="messages"></div><input type="text" placeholder="메시지를 입력하세요"><input type="submit" value="전송"></form>');

    function showLatestMessage(element) {
        $(element).find('.messages').scrollTop($(element + ' .messages')[0].scrollHeight);
    }

    $(element + ' input[type="text"]').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $(element + ' input[type="submit"]').click();
        }
    });

    $(element + ' input[type="submit"]').click(function (event) {
        event.preventDefault();
        var message = $(element + ' input[type="text"]').val();
        if (message) {
            var d = new Date();
            var currentDate = d.toLocaleString('ko-KR', { hour12: false });

            $(element + ' div.messages').append(
                '<div class="message"><div class="myMessage"><p>' +
                message +
                "</p><date>" +
                currentDate +
                "</date></div></div>"
            );

            $(element + ' input[type="text"]').val("");
            showLatestMessage(element);

            setTimeout(function() {
                switch(currentState) {
                    case 'initial':
                        inviteEmail = message;
                        if (isValidEmail(inviteEmail)) {
                            sendInvitation(inviteEmail, element, currentDate);
                        } else {
                            responsiveChatPush(element, '시스템', 'you', currentDate, "유효한 이메일 주소를 입력해주세요.");
                        }
                        break;
                    case 'completed':
                        if (message.toLowerCase() === '새 초대') {
                            currentState = 'initial';
                            responsiveChatPush(element, '시스템', 'you', currentDate, "초대할 팀원의 이메일 주소를 입력해주세요.");
                        } else {
                            sendMessage(inviteEmail, message, element, currentDate);
                        }
                        break;
                }
            }, 1000);
        }
    });
}

function responsiveChatPush(element, sender, origin, date, message) {
    var originClass = origin == 'me' ? 'myMessage' : 'fromThem';
    $(element + ' .messages').append('<div class="message"><div class="' + originClass + '"><p>' + message + '</p><date><b>' + sender + '</b> ' + date + '</date></div></div>');
    $(element).find('.messages').scrollTop($(element + ' .messages')[0].scrollHeight);
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sendInvitation(email, element, currentDate) {
    // 여기에 실제 초대 로직을 구현할 수 있습니다.
    responsiveChatPush(element, '시스템', 'you', currentDate, `${email} 주소로 초대 메시지를 보냈습니다.`);
    currentState = 'completed';
}

function sendMessage(receiverEmail, content, element, currentDate) {
    ajaxWithToken('/api/messages/send', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            receiverEmail: receiverEmail,
            content: content
        })
    })
        .done(function(response) {
            console.log('Message sent:', response);
            responsiveChatPush(element, '시스템', 'you', currentDate, '메시지가 성공적으로 전송되었습니다.');
        })
        .fail(function(error) {
            console.error('Error sending message:', error);
            responsiveChatPush(element, '시스템', 'you', currentDate, '메시지 전송에 실패했습니다.');
        });
}

// 초기 메시지 설정
document.addEventListener('DOMContentLoaded', (event) => {
    responsiveChat('.responsive-html5-chat');
    setTimeout(function() {
        var d = new Date();
        var currentDate = d.toLocaleString('ko-KR', { hour12: false });
        responsiveChatPush('.chat', '시스템', 'you', currentDate, '팀원을 초대하기 위해 이메일 주소를 입력해주세요.');
    }, 1000);
});