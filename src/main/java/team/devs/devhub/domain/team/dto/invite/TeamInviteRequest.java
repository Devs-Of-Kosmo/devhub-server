package team.devs.devhub.domain.team.dto.invite;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TeamInviteRequest {

    @NotNull
    @Schema(description = "초대할 팀의 id", example = "1")
    private Long inviteTeamId;
    @NotBlank
    @Schema(description = "초대할 유저의 이메일", example = "qwer@gmail.com")
    private String toEmail;
}
