package team.devs.devhub.domain.user.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class ReissueRequest {

    @NotBlank
    private String accessToken;
}
