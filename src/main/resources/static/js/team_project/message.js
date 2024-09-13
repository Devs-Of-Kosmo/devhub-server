let currentState = 'initial';
let inviteEmail = '';
let selectedTeamId = null;

function ajaxWithToken(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
    return $.ajax(url, options);
}

function responsiveChat(element) {
    $(element).html(`
        <form class="chat">
            <div class="messages"></div>
            <div class="input-area">
                <div class="input-group">
                    <div class="select-wrapper">
                        <select id="teamSelection">
                            <option value="">팀을 선택해주세요</option>
                        </select>
                    </div>
                    <input type="email" id="inviteEmail" placeholder="초대할 팀원의 이메일" disabled>
                </div>
                <button type="submit" class="send-button" disabled>
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </form>
    `);

    loadTeams();

    function showLatestMessage(element) {
        $(element).find('.messages').scrollTop($(element + ' .messages')[0].scrollHeight);
    }

    $('#teamSelection').on('change', function() {
        selectedTeamId = $(this).val();
        $('#inviteEmail').prop('disabled', !selectedTeamId);
        $('.send-button').prop('disabled', !selectedTeamId);
    });

    $('#inviteEmail').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $('.send-button').click();
        }
    });

    $('.send-button').click(function (event) {
        event.preventDefault();
        var email = $('#inviteEmail').val();
        if (email && selectedTeamId) {
            var d = new Date();
            var currentDate = d.toLocaleString('ko-KR', { hour12: false });

            $(element + ' div.messages').append(
                '<div class="message"><div class="myMessage"><p>' +
                email +
                "</p><date>" +
                currentDate +
                "</date></div></div>"
            );

            $('#inviteEmail').val("");
            showLatestMessage(element);

            setTimeout(function() {
                if (isValidEmail(email)) {
                    sendInvitation(selectedTeamId, email, element, currentDate);
                } else {
                    responsiveChatPush(element, '시스템', 'you', currentDate, "유효한 이메일 주소를 입력해주세요.");
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

function sendInvitation(teamId, email, element, currentDate) {
    ajaxWithToken('/api/invite', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            inviteTeamId: teamId,
            toEmail: email
        })
    })
        .done(function(response) {
            console.log('Invitation sent:', response);
            responsiveChatPush(element, '시스템', 'you', currentDate, `${email} 주소로 초대 메시지를 보냈습니다.`);
            responsiveChatPush(element, '시스템', 'you', currentDate, `초대 유효기간은 3일입니다.`);
            const inviteConfirmationUrl = `/team-project/${teamId}?invitedEmail=${encodeURIComponent(email)}`;
        })
        .fail(function(error) {
            console.error('Error sending invitation.js:', error);
            responsiveChatPush(element, '시스템', 'you', currentDate, '초대 메시지 전송에 실패했습니다.');
        });
}

function loadTeams() {
    ajaxWithToken('/api/team/group/list')
        .done(function(teams) {
            const teamSelection = $('#teamSelection');
            teamSelection.empty().append('<option value="">팀을 선택해주세요</option>');
            $.each(teams, function(_, team) {
                teamSelection.append($('<option>').val(team.teamId).text(team.teamName));
            });
        })
        .fail(function(error) {
            console.error('Error loading teams:', error);
            responsiveChatPush('.chat', '시스템', 'you', new Date().toLocaleString('ko-KR', { hour12: false }), '팀 목록을 불러오는데 실패했습니다.');
        });
}

function handleInviteConfirmation(teamId, invitedEmail) {
    window.location.href = `/team-project/${teamId}?invitedEmail=${encodeURIComponent(invitedEmail)}`;
}

function onTeamProjectPageLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const invitedEmail = urlParams.get('invitedEmail');

    if (invitedEmail) {
        checkUserAndInvitation(invitedEmail);
    }
}

function checkUserAndInvitation(invitedEmail) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        redirectToLogin();
        return;
    }

    ajaxWithToken('/api/user/info', {
        method: 'GET'
    })
        .done(function(response) {
            if (response.email !== invitedEmail) {
                forceLogout();
                alert('초대된 이메일과 현재 로그인된 계정이 일치하지 않습니다. 다시 로그인해 주세요.');
                redirectToLogin();
            } else {
                checkInvitationValidity(invitedEmail);
            }
        })
        .fail(function(error) {
            console.error('사용자 정보 조회 실패:', error);
            forceLogout();
            redirectToLogin();
        });
}

function checkInvitationValidity(invitedEmail) {
    const teamId = new URLSearchParams(window.location.search).get('teamId');

    ajaxWithToken(`/api/invite/check?email=${encodeURIComponent(invitedEmail)}&teamId=${teamId}`, {
        method: 'GET'
    })
        .done(function(response) {
            if (response.isValid) {
                if (response.alreadyMember) {
                    alert('이미 해당 팀의 멤버입니다.');
                    window.location.href = `/team-project/${teamId}`;
                } else if (response.expired) {
                    alert('초대 유효기간이 만료되었습니다. 새로운 초대를 요청해주세요.');
                    window.location.href = '/';
                } else {
                    // 유효한 초대인 경우 팀 가입 처리
                    joinTeam(teamId, invitedEmail);
                }
            } else {
                alert('유효하지 않은 초대입니다.');
                window.location.href = '/';
            }
        })
        .fail(function(error) {
            console.error('초대 확인 실패:', error);
            alert('초대 확인 중 오류가 발생했습니다.');
            window.location.href = '/';
        });
}

function joinTeam(teamId, invitedEmail) {
    ajaxWithToken('/api/team/join', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            teamId: teamId,
            email: invitedEmail
        })
    })
        .done(function(response) {
            alert('팀에 성공적으로 가입되었습니다.');
            window.location.href = `/team-project/${teamId}`;
        })
        .fail(function(error) {
            console.error('팀 가입 실패:', error);
            alert('팀 가입 중 오류가 발생했습니다.');
            window.location.href = '/';
        });
}

window.logout = function() {
    localStorage.removeItem('accessToken');
    location.reload();
}

function forceLogout() {
    window.logout();
}

function redirectToLogin() {
    window.location.href = '/login';
}

document.addEventListener('DOMContentLoaded', (event) => {
    responsiveChat('.responsive-html5-chat');
    setTimeout(function() {
        var d = new Date();
        var currentDate = d.toLocaleString('ko-KR', { hour12: false });
        responsiveChatPush('.chat', '시스템', 'you', currentDate, '팀을 선택하고 초대할 팀원의 이메일 주소를 입력해주세요.');
    }, 1000);

    const closeButton = document.querySelector('#inviteMembers .close-button-phone');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            closeWindow('inviteMembers');
        });
    }

    if (window.location.pathname.startsWith('/team-project/')) {
        onTeamProjectPageLoad();
    }
});