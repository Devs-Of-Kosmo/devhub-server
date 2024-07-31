package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoCreateResponse {

    private Long newProjectId;
    private String projectName;
    private String description;
    private Long masterId;

    public static PersonalProjectRepoCreateResponse of(PersonalProject project) {
        return PersonalProjectRepoCreateResponse.builder()
                .newProjectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .masterId(project.getMaster().getId())
                .build();
    }
}
