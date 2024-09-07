// 팀 초대 링크 눌렀을 때
// 1. 로그인 안 돼있으면 로그인(로그인 예외 핸들러에서 처리)
// 2. code와 redirectPath가 존재한다면 초대 수락 거절 다이어그램 창 띄우기
const codeElement = document.getElementById('code');
const redirectPathElement = document.getElementById('redirectPath');

const code = codeElement ? codeElement.getAttribute('data-code') : null;
const redirectPath = redirectPathElement ? redirectPathElement.getAttribute('data-redirectPath') : null;

let isJoinToTeam = -1;
if (!(code == null || redirectPath == null)) {
    if (confirm('팀에 참여하시겠습니까?')) {
        isJoinToTeam = 1;
    } else {
        isJoinToTeam = 0;
    }
}
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
            var errorMessage = '로그인 실패';
            if (error.responseJSON && error.responseJSON.message) {
                errorMessage = '로그인 실패: ' + error.responseJSON.message;
            } else if (error.statusText) {
                errorMessage = '로그인 실패: ' + error.statusText;
            }

            Swal.fire({
                title: '오류',
                icon: 'error',
                confirmButtonText: '확인'
            });

            console.error(error);
            window.location.href = '/team_project';
        }
    });
} else if (isJoinToTeam == 0) {
    window.location.href = '/team_project';
}