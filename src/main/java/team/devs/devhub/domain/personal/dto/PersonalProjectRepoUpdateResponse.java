package team.devs.devhub.domain.personal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personal.domain.PersonalProject;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoUpdateResponse {

    private Long projectId;
    private String projectNameAfterChange;
    private String descriptionAfterChange;

    public static PersonalProjectRepoUpdateResponse of(PersonalProject project) {
        return PersonalProjectRepoUpdateResponse.builder()
                .projectId(project.getId())
                .projectNameAfterChange(project.getName())
                .descriptionAfterChange(project.getDescription())
                .build();
    }
}
