package team.devs.devhub.global.socket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;
import team.devs.devhub.domain.message.exception.EmailNotFoundException;
import team.devs.devhub.domain.message.exception.InvalidWebSocketSessionException;
import team.devs.devhub.domain.message.exception.MessageCountingNullException;
import team.devs.devhub.domain.message.repository.MessageRepository;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.util.HashMap;
import java.util.Optional;

@RequiredArgsConstructor
@Component
public class MessageWebSocketHandler extends TextWebSocketHandler {

    HashMap<String, WebSocketSession> wsSessionMap = new HashMap<>();
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception{

        // 웹소켓 연결 후 실행 되는 로직
        String email = searchEmail(session).orElseThrow(() -> new EmailNotFoundException(ErrorCode.EMAIL_NOT_FOUND));

        wsSessionMap.put(email, session);
        User selectUser = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Long unreadCount = messageRepository.countByReceiverAndReadConditionAndReceiverDeleteCondition(selectUser, false, false)
                .orElseThrow(() -> new MessageCountingNullException(ErrorCode.MESSAGE_COUNTING_NULL));

        String unreadCountString = unreadCount.toString();

        session.sendMessage(new TextMessage(unreadCountString));
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception{
        // 웹소켓 연결 종료 후 실행되는 로직
        String email = searchEmail(session).orElseThrow(() -> new EmailNotFoundException(ErrorCode.EMAIL_NOT_FOUND));
        wsSessionMap.remove(email);
    }

    public void sendNotification(String email, String message) throws Exception {
        // 특정 사용자에게 웹소켓 메시지 발송 로직
        WebSocketSession session = wsSessionMap.get(email);
        
        if (session != null && session.isOpen()) {
            session.sendMessage(new TextMessage(message));
        }else{
            throw new InvalidWebSocketSessionException(ErrorCode.INVALID_WEBSOCKET_SESSION);
        }
    }

    // 웹소켓 세션 URI를 파싱하여 email를 찾는 함수
    public Optional<String> searchEmail(WebSocketSession session) {
        UriComponents uriComponents = UriComponentsBuilder.fromUriString(session.getUri().toString()).build();
        return Optional.ofNullable(uriComponents.getQueryParams().getFirst("email"));
    }
}
