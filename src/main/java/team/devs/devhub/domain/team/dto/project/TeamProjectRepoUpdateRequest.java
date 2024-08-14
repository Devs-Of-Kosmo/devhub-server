package team.devs.devhub.domain.team.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;

@Getter
public class TeamProjectRepoUpdateRequest {

    @NotNull
    private Long projectId;
    @NotBlank
    private String changedProjectName;
    @NotBlank
    private String changedDescription;

    public TeamProject toEntity() {
        return TeamProject.builder()
                .name(changedProjectName)
                .description(changedDescription)
                .build();
    }
}
