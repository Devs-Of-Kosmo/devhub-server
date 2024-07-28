package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoCreateResponse {

    private Long personalProjectId;
    private String projectName;
    private String description;
    private Long masterId;

    public static PersonalProjectRepoCreateResponse of(PersonalProject personalProject) {
        return PersonalProjectRepoCreateResponse.builder()
                .personalProjectId(personalProject.getId())
                .projectName(personalProject.getName())
                .description(personalProject.getDescription())
                .masterId(personalProject.getMaster().getId())
                .build();
    }
}
