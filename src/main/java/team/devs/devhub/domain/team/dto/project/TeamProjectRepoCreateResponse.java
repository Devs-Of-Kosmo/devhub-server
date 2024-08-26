package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectRepoCreateResponse {

    private Long newProjectId;
    private String projectName;
    private String description;
    private Long createdBy;

    public static TeamProjectRepoCreateResponse of(TeamProject project) {
        return TeamProjectRepoCreateResponse.builder()
                .newProjectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .createdBy(project.getCreatedBy().getId())
                .build();
    }
}
