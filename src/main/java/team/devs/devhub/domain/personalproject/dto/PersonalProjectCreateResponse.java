package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectCreateResponse {

    private Long personalProjectId;
    private String projectName;
    private String description;
    private Long masterId;

    public static PersonalProjectCreateResponse of(PersonalProject personalProject) {
        return PersonalProjectCreateResponse.builder()
                .personalProjectId(personalProject.getId())
                .projectName(personalProject.getName())
                .description(personalProject.getDescription())
                .masterId(personalProject.getMaster().getId())
                .build();
    }
}
