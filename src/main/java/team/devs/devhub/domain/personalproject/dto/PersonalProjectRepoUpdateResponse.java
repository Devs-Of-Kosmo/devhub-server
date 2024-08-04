package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoUpdateResponse {

    private Long projectId;
    private String changedProjectName;
    private String changedDescription;

    public static PersonalProjectRepoUpdateResponse of(PersonalProject project) {
        return PersonalProjectRepoUpdateResponse.builder()
                .projectId(project.getId())
                .changedProjectName(project.getName())
                .changedDescription(project.getDescription())
                .build();
    }
}
