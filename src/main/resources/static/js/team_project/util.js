// 전역 변수로 휴지통에 있는 팀들을 추적
let trashedTeams = [];

// accessToken을 가져오는 함수
function getAccessToken() {
    return localStorage.getItem('accessToken');
}

// 시계 업데이트 함수
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    $('#clock').text(`${hours}:${minutes}`);
}

// jQuery를 사용한 초기화 함수
$(document).ready(function() {
    // 시계 업데이트 시작
    setInterval(updateClock, 1000);
    updateClock();

    // 기타 초기화 작업들...
});