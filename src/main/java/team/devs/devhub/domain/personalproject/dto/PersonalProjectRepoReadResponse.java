package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoReadResponse {

    private Long personalProjectId;
    private String projectName;
    private String description;
    private LocalDateTime createdDate;

    public static PersonalProjectRepoReadResponse of(PersonalProject project) {
        return PersonalProjectRepoReadResponse.builder()
                .personalProjectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .createdDate(project.getCreatedDate())
                .build();
    }
}
