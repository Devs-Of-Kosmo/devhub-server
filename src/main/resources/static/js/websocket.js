export default function connectWebSocket(socketEmail) {
    const socket = new WebSocket(`ws://localhost:8080/ws/message?email=${socketEmail}`);
    // 웹소켓 이벤트 리스너 정의
    socket.onopen = function(event) {
        console.log("웹소켓 연결이 열렸습니다.");
    };

    socket.onmessage = function(event) {
        console.log("서버로부터 메시지 수신:", event.data);
        document.getElementById('message-link').textContent = "읽지 않은 쪽지 (" + event.data + ")";
        updateMessageCount(event.data);
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
