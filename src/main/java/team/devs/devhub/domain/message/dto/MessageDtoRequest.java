package team.devs.devhub.domain.message.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import team.devs.devhub.domain.message.domain.Message;
import team.devs.devhub.domain.user.domain.User;

@Getter
public class MessageDtoRequest {

    @NotBlank
    private String content;

    @Email
    @NotBlank
    private String receiverEmail;

    public Message toEntity(User sender, User receiver) {
        return Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .readCondition(false)
                .senderDeleteCondition(false)
                .receiverDeleteCondition(false)
                .build();
    }
}
