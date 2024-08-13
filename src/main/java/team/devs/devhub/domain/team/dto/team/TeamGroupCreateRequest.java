package team.devs.devhub.domain.team.dto.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.user.domain.User;

@Getter
public class TeamGroupCreateRequest {

    @NotBlank
    @Schema(description = "생성할 팀 이름", example = "팀1")
    private String teamName;
    @Schema(description = "팀 설명", example = "저희는 팀1 입니다")
    private String description;

    public Team toEntity(User user) {
        return Team.builder()
                .name(teamName)
                .description(description)
                .createdBy(user)
                .build();
    }
}
