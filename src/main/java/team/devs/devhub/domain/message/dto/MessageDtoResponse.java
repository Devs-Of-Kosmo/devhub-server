package team.devs.devhub.domain.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.message.domain.Message;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class MessageDtoResponse {

    private Long id;
    private String senderEmail;
    private String receiverEmail;
    private String content;
    private String inviteUrl;
    private LocalDateTime createdDate;
    private boolean readCondition;

    public static MessageDtoResponse of(Message message) {
        return MessageDtoResponse.builder()
                .id(message.getId())
                .senderEmail(message.getSender().getEmail())
                .receiverEmail(message.getReceiver().getEmail())
                .content(message.getContent())
                .inviteUrl(message.getInviteUrl())
                .createdDate(message.getCreatedDate())
                .readCondition(message.isReadCondition())
                .build();
    }
}
