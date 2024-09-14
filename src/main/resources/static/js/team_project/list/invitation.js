let currentTeamName = '';

function ajaxWithToken(url, options = {}) {
    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + localStorage.getItem('accessToken');
    return $.ajax(url, options);
}

function setupInvitationModal() {
    console.log("Setting up invitation modal");
    getCurrentTeamInfo();
    setupEventListeners();
}

function getCurrentTeamInfo() {
    console.log("Getting current team info");
    const currentTeamId = getCurrentTeamId();
    console.log("Current Team ID:", currentTeamId);
    if (currentTeamId) {
        ajaxWithToken(`/api/team/group/${currentTeamId}`)
            .done(function(teamInfo) {
                console.log("Team info received:", teamInfo);
                currentTeamName = teamInfo.teamName;
                updateTeamDisplay();
            })
            .fail(function(error) {
                console.error('Error fetching team info:', error);
                showAlert('오류', '팀 정보를 불러오는데 실패했습니다.', 'error');
            });
    } else {
        console.error("No team ID found");
        showAlert('오류', '현재 팀 정보를 찾을 수 없습니다.', 'error');
    }
}

function getCurrentTeamId() {
    const pathSegments = window.location.pathname.split('/');
    const teamProjectListIndex = pathSegments.indexOf('team_project_list');
    if (teamProjectListIndex !== -1 && teamProjectListIndex + 1 < pathSegments.length) {
        return pathSegments[teamProjectListIndex + 1];
    }
    return null;
}

function updateTeamDisplay() {
    console.log("Updating team display");
    $('#currentTeamName').text(currentTeamName);
    $('#inviteEmail').prop('disabled', false);
    $('#sendInviteButton').prop('disabled', false);
}

function setupEventListeners() {
    $('#inviteEmail').keypress(function (event) {
        if (event.which == 13) {
            event.preventDefault();
            $('#sendInviteButton').click();
        }
    });

    $('#sendInviteButton').click(function (event) {
        event.preventDefault();
        var email = $('#inviteEmail').val();
        const currentTeamId = getCurrentTeamId();
        if (email && currentTeamId) {
            if (isValidEmail(email)) {
                sendInvitation(currentTeamId, email);
            } else {
                showAlert('유효하지 않은 이메일', '유효한 이메일 주소를 입력해주세요.', 'error');
            }
        }
    });
}

function isValidEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function sendInvitation(teamId, email) {
    console.log("Sending invitation to:", email, "for team:", teamId);

    // 로딩 화면 표시
    Swal.fire({
        title: '초대 메일 전송 중...',
        html: '잠시만 기다려주세요.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        allowEnterKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    ajaxWithToken('/api/invite', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            inviteTeamId: parseInt(teamId),
            toEmail: email
        })
    })
        .done(function(response) {
            console.log('Invitation sent:', response);
            Swal.fire({
                title: '초대 성공',
                text: `${email} 주소로 초대 메시지를 보냈습니다.\n초대 유효기간은 3일입니다.`,
                icon: 'success',
                confirmButtonText: '확인'
            });
            $('#inviteEmail').val(''); // 이메일 입력 필드 초기화
        })
        .fail(function(error) {
            console.error('Error sending invitation:', error);
            console.error('Error details:', error.responseText);
            Swal.fire({
                title: '초대 실패',
                text: '초대 메시지 전송에 실패했습니다.',
                icon: 'error',
                confirmButtonText: '확인'
            });
        });
}

function joinTeam(code) {
    console.log("Joining team with code:", code);
    ajaxWithToken('/api/invite/join', {
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            code: code
        })
    })
        .done(function(response) {
            console.log('Team joined successfully:', response);
            showAlert('팀 가입 성공', '팀에 성공적으로 가입되었습니다.', 'success')
                .then((result) => {
                    if (result.isConfirmed) {
                        window.location.reload(); // 페이지 새로고침
                    }
                });
        })
        .fail(function(error) {
            console.error('Error joining team:', error);
            console.error('Error details:', error.responseText);
            showAlert('팀 가입 실패', '팀 가입 중 오류가 발생했습니다.', 'error');
        });
}

function showAlert(title, text, icon) {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: '확인'
    });
}

$(document).ready(function() {
    console.log("Document ready");
    setupInvitationModal();

    // 팀원 초대 아이콘 클릭 이벤트
    $('[data-title="inviteMembers"]').on('click', function() {
        console.log("Invite members icon clicked");
        $('#inviteMembersModal').show();
        getCurrentTeamInfo();
    });

    // 모달 닫기 버튼 이벤트
    $('#inviteMembersModal .close-button').on('click', function() {
        console.log("Modal close button clicked");
        $('#inviteMembersModal').hide();
    });

    // URL에서 초대 코드 확인
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('code');

    if (inviteCode) {
        // 초대 코드가 있으면 팀 가입 처리
        joinTeam(inviteCode);
    }
});

// 전역 스코프에 함수 노출
window.getCurrentTeamId = getCurrentTeamId;