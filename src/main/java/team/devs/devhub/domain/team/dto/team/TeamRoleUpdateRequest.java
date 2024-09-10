package team.devs.devhub.domain.team.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TeamRoleUpdateRequest {

    @NotNull
    @Schema(description = "팀 id", example = "1")
    private Long teamId;
    @NotNull
    @Schema(description = "역할을 부여할 팀원의 id", example = "1")
    private Long targetUserId;
}
