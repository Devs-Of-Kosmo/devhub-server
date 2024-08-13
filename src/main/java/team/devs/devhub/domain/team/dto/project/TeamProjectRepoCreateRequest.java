package team.devs.devhub.domain.team.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.user.domain.User;

@Getter
public class TeamProjectRepoCreateRequest {

    @NotNull
    @Schema(description = "프로젝트를 생성하는 팀의 id", example = "1")
    private Long teamId;
    @NotBlank
    @Schema(description = "생성할 팀 프로젝트 이름", example = "팀 프로젝트1")
    private String projectName;
    @Schema(description = "생성할 팀 프로젝트 설명", example = "팀1 프로젝트입니다")
    private String description;

    public TeamProject toEntity(Team team, User user) {
        return TeamProject.builder()
                .name(projectName)
                .description(description)
                .team(team)
                .createdBy(user)
                .build();
    }
}
