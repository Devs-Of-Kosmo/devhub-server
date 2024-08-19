package team.devs.devhub.domain.team.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;

@Getter
public class TeamProjectRepoUpdateRequest {

    @NotNull
    @Schema(description = "업데이트할 프로젝트의 팀 id", example = "1")
    private Long projectId;
    @NotBlank
    @Schema(description = "수정할 프로젝트 이름", example = "변경된 팀프로젝트1")
    private String changedProjectName;
    @NotBlank
    @Schema(description = "수정할 프로젝트 설명", example = "변경된 팀프로젝트1 입니다")
    private String changedDescription;

    public TeamProject toEntity() {
        return TeamProject.builder()
                .name(changedProjectName)
                .description(changedDescription)
                .build();
    }
}
