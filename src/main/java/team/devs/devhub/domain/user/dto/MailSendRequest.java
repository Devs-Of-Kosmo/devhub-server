package team.devs.devhub.domain.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class MailSendRequest {

    @Email
    @NotBlank
    private String email;
}
