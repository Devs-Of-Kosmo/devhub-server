package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MailSendResponse {

    private String toEmail;

    public static MailSendResponse of(String toEmail) {
        return MailSendResponse.builder()
                .toEmail(toEmail)
                .build();
    }
}
