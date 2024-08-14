package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamProject;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectRepoReadResponse {

    private Long projectId;
    private String projectName;
    private String description;
    private LocalDateTime createdDate;

    public static TeamProjectRepoReadResponse of(TeamProject project) {
        return TeamProjectRepoReadResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .createdDate(project.getCreatedDate())
                .build();
    }
}
