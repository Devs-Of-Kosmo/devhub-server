package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectReadResponse {

    private Long personalProjectId;
    private String projectName;
    private String description;
    private LocalDateTime createdDate;

    public static PersonalProjectReadResponse of(PersonalProject personalProject) {
        return PersonalProjectReadResponse.builder()
                .personalProjectId(personalProject.getId())
                .projectName(personalProject.getName())
                .description(personalProject.getDescription())
                .createdDate(personalProject.getCreatedDate())
                .build();
    }
}
