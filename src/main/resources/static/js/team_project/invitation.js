
const codeElement = document.getElementById('code');
const redirectPathElement = document.getElementById('redirectPath');

const code = codeElement ? codeElement.getAttribute('data-code') : null;
const redirectPath = redirectPathElement ? redirectPathElement.getAttribute('data-redirectPath') : null;

let isJoinToTeam = -1;
if (!(code == null || redirectPath == null)) {
    Swal.fire({
        title: '팀 참여',
        text: '팀에 참여하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '참여',
        cancelButtonText: '취소'
    }).then((result) => {
        if (result.isConfirmed) {
            isJoinToTeam = 1;
            handleTeamJoin();
        } else {
            isJoinToTeam = 0;
            window.location.href = '/team_project';
        }
    });
} else {
    handleTeamJoin();
}

function handleTeamJoin() {
    // 3. request body에 code 담아서 redirectPath로 api 요청
    if (isJoinToTeam == 1) {
        const accessToken = localStorage.getItem('accessToken');

        var formData = {
            'code' : code
        };

        $.ajax({
            type: 'POST',
            url: redirectPath,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            data: JSON.stringify(formData),
            contentType: 'application/json',
            dataType: 'json',
            success: function(response) {
                window.location.href = '/team_project';
            },
            error: function(error) {
                Swal.fire({
                    title: '오류',
                    text: '초대한 아이디와 이메일이 일치하지 않습니다.',
                    icon: 'error',
                    confirmButtonText: '확인'
                }).then(() => {
                    logout();
                    openLoginModal();
                });
            }
        });
    }
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('accessToken');
}

// 로그인 모달 열기 함수
function openLoginModal() {
    $('#loginModal').show();
}