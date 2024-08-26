package team.devs.devhub.domain.message.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import team.devs.devhub.domain.message.domain.Message;

import team.devs.devhub.domain.message.dto.MessageDtoRequest;
import team.devs.devhub.domain.message.dto.MessageDtoResponse;
import team.devs.devhub.domain.message.dto.MessageSaveResponse;
import team.devs.devhub.domain.message.exception.MessageCountingNullException;
import team.devs.devhub.domain.message.exception.MessageNotFoundException;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.security.CustomUserDetails;
import team.devs.devhub.global.socket.MessageWebSocketHandler;
import team.devs.devhub.domain.message.repository.MessageRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final MessageWebSocketHandler messageWebSocketHandler;

    // 쪽지 발송
    public MessageSaveResponse saveMessage(MessageDtoRequest request, CustomUserDetails customUserDetails) {
        // seder
        Long senderId = customUserDetails.getId();
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        // receiver
        String receiverEmail = request.getReceiverEmail();
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Message message = request.toEntity(sender, receiver);
        MessageSaveResponse messageSaveResponse = MessageSaveResponse.of(messageRepository.save(message));

        Long unreadCount = messageRepository.countByReceiverAndReadConditionAndReceiverDeleteCondition(receiver, false, false)
                .orElseThrow(() -> new MessageCountingNullException(ErrorCode.MESSAGE_COUNTING_NULL));

        String unreadCountString = unreadCount.toString();
        sendNotification(receiver.getEmail(),unreadCountString);

        return messageSaveResponse;

    }

    // 보낸 쪽지함 조회
    public List<MessageDtoResponse> getSentMessages(CustomUserDetails customUserDetails){

        Long senderId = customUserDetails.getId();
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<Message> sentMessages = messageRepository.findBySenderAndSenderDeleteConditionOrderByCreatedDateDesc(sender, false);
        return sentMessages.stream()
                .map(MessageDtoResponse::of)
                .collect(Collectors.toList());
    }

    // 받은 쪽지함 조회
    public List<MessageDtoResponse> getReceivedMessages(CustomUserDetails customUserDetails) {

        Long receiverId = customUserDetails.getId();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<Message> receiveMessages = messageRepository.findByReceiverAndReceiverDeleteConditionOrderByCreatedDateDesc(receiver, false);
        return receiveMessages.stream()
                .map(MessageDtoResponse::of)
                .collect(Collectors.toList());
    }

    // 쪽지 조회
    public MessageDtoResponse getMessage(Long id){

        Message getMessage = messageRepository.findById(id)
                .orElseThrow(() -> new MessageNotFoundException(ErrorCode.MESSAGE_NOT_FOUND));

        return MessageDtoResponse.of(getMessage);
    }

    // 쪽지 삭제
    public List<MessageDtoResponse> deleteMessage(CustomUserDetails customUserDetails, Long messageId, String box){

        List<MessageDtoResponse> deleteCompleteMessage = new ArrayList<>();

        Message deleteMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(ErrorCode.MESSAGE_NOT_FOUND));

        Long receiverId = customUserDetails.getId();
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        if(box.equals("received")){

            deleteMessage.updateReceiverDeleteCondition(true);
            MessageSaveResponse.of(messageRepository.save(deleteMessage));

            Long unreadCount = messageRepository.countByReceiverAndReadConditionAndReceiverDeleteCondition(receiver, false, false)
                    .orElseThrow(() -> new MessageCountingNullException(ErrorCode.MESSAGE_COUNTING_NULL));

            String unreadCountString = unreadCount.toString();
            sendNotification(receiver.getEmail(), unreadCountString);

            deleteCompleteMessage = getReceivedMessages(customUserDetails);

        }else if (box.equals("sent")){
            deleteMessage.updateSenderDeleteCondition(true);
            MessageSaveResponse.of(messageRepository.save(deleteMessage));

            deleteCompleteMessage = getSentMessages(customUserDetails);
        }
        return deleteCompleteMessage;
    }

    // 쪽지 확인 여부 로직
    public MessageDtoResponse readCheckMessage(CustomUserDetails customUserDetails, Long messageId){

        Long userid = customUserDetails.getId();
        User receiver = userRepository.findById(userid)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Message readMessage = messageRepository.findById(messageId)
                .orElseThrow(() -> new MessageNotFoundException(ErrorCode.MESSAGE_NOT_FOUND));

        if (!readMessage.isReadCondition()) {
            readMessage.readCondition(true);
            MessageSaveResponse.of(messageRepository.save(readMessage));

            Long unreadCount = messageRepository.countByReceiverAndReadConditionAndReceiverDeleteCondition(receiver, false, false)
                    .orElseThrow(() -> new MessageCountingNullException(ErrorCode.MESSAGE_COUNTING_NULL));

            String unreadCountString = unreadCount.toString();
            sendNotification(receiver.getEmail(), unreadCountString);

        }

        return MessageDtoResponse.of(readMessage);
    }

    public void sendNotification(String email, String message) {

        try {
            messageWebSocketHandler.sendNotification(email, message);
        } catch (Exception e) {
            // 예외 발생 시 로그를 남기고 예외를 무시
            System.err.println("웹소켓 메시지 발송 중 오류 발생: " + e.getMessage());

        }
    }
}