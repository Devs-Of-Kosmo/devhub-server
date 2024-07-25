package team.devs.devhub.domain.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.message.domain.Message;

@Getter
@Builder
@AllArgsConstructor
public class MessageSaveResponse {

    private Long id;

    public static MessageSaveResponse of(Message message) {
        return MessageSaveResponse.builder()
                .id(message.getId())
                .build();
    }
}
