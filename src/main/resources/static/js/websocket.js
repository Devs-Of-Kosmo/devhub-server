export default function connectWebSocket(socketEmail) {
    const socket = new WebSocket(`ws://localhost:8080/ws/message?email=${socketEmail}`);

    socket.onopen = function(event) {
        console.log("웹소켓 연결이 열렸습니다.");
    };

    socket.onmessage = function(event) {
        console.log("서버로부터 메시지 수신:", event.data);

        const messageLink = document.getElementById('message-link');
        if (messageLink) {
            messageLink.textContent = `읽지 않은 쪽지 (${event.data})`;
        } else {
            console.warn("'message-link' 요소를 찾을 수 없습니다.");
        }

        if (typeof updateMessageCount === 'function') {
            updateMessageCount(event.data);
        } else {
            console.warn("updateMessageCount 함수가 정의되지 않았습니다.");
        }
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            console.log(`웹소켓 연결이 정상적으로 닫혔습니다. 코드: ${event.code}, 이유: ${event.reason}`);
        } else {
            console.error(`웹소켓 연결이 비정상적으로 닫혔습니다.`);
        }
    };

    socket.onerror = function(error) {
        console.error("웹소켓 에러 발생:", error);
    };

    return socket;
}