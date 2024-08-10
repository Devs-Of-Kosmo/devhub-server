let currentState = 'initial';
let inviteEmail = '';

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
                            responsiveChatPush(element, '시스템', 'you', currentDate, `${inviteEmail} 주소로 초대 메시지를 보냈습니다.`);
                            currentState = 'completed';
                        } else {
                            responsiveChatPush(element, '시스템', 'you', currentDate, "유효한 이메일 주소를 입력해주세요.");
                        }
                        break;
                    case 'completed':
                        if (message.toLowerCase() === '새 초대') {
                            currentState = 'initial';
                            responsiveChatPush(element, '시스템', 'you', currentDate, "초대할 팀원의 이메일 주소를 입력해주세요.");
                        } else {
                            responsiveChatPush(element, '시스템', 'you', currentDate, "초대가 완료되었습니다. 새로운 초대를 시작하려면 '새 초대'라고 입력해주세요.");
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

// 초기 메시지 설정
document.addEventListener('DOMContentLoaded', (event) => {
    responsiveChat('.responsive-html5-chat');
    setTimeout(function() {
        var d = new Date();
        var currentDate = d.toLocaleString('ko-KR', { hour12: false });
        responsiveChatPush('.chat', '시스템', 'you', currentDate, '팀원을 초대하기 위해 이메일 주소를 입력해주세요.');
    }, 1000);
});