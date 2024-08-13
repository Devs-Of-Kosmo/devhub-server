package team.devs.devhub.domain.team.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;

@Getter
public class TeamGroupUpdateRequest {

    @NotNull
    @Schema(description = "변경할 팀 id", example = "1")
    private Long teamId;
    @NotBlank
    @Schema(description = "변경할 팀 이름", example = "변경된 팀1")
    private String changedTeamName;
    @NotBlank
    @Schema(description = "변경할 팀 소개", example = "변경된 팀1 소개 입니다")
    private String changedDescription;

    public Team toEntity() {
        return Team.builder()
                .name(changedTeamName)
                .description(changedDescription)
                .build();
    }
}
