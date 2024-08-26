package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectRepoUpdateResponse {

    private Long projectId;
    private String projectNameAfterChange;
    private String descriptionAfterChange;

    public static TeamProjectRepoUpdateResponse of(TeamProject project) {
        return TeamProjectRepoUpdateResponse.builder()
                .projectId(project.getId())
                .projectNameAfterChange(project.getName())
                .descriptionAfterChange(project.getDescription())
                .build();
    }
}
