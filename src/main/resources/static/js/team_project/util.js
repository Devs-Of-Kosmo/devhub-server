// 전역 변수로 휴지통에 있는 팀들을 추적
window.trashedTeams = [];

// accessToken을 가져오는 함수
window.getAccessToken = function() {
    return localStorage.getItem('accessToken');
}

// 시계 업데이트 함수
window.updateClock = function() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    $('#clock').text(`${hours}:${minutes}`);
}

// 에러 처리 함수
window.handleAjaxError = function(error) {
    if (error.responseJSON && error.responseJSON.message === 'Unauthorized: Please log in again') {
        alert('세션이 만료되었습니다. 다시 로그인해주세요.');
        window.openWindow('loginModal');
    } else {
        alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
}

// JWT 토큰을 포함한 인증된 요청을 보내는 함수
window.sendAuthenticatedRequest = function(url, method = 'GET', data = null) {
    return $.ajax({
        url: url,
        type: method,
        data: JSON.stringify(data),
        contentType: 'application/json',
        headers: {
            'Authorization': 'Bearer ' + window.getAccessToken()
        },
        error: function(jqXHR) {
            if (jqXHR.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
        }
    });
}

// jQuery를 사용한 초기화 함수
$(document).ready(function() {
    // 시계 업데이트 시작
    setInterval(window.updateClock, 1000);
    window.updateClock();
});