package team.devs.devhub.domain.personal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personal.domain.PersonalProject;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectRepoReadResponse {

    private Long projectId;
    private String projectName;
    private String description;
    private LocalDateTime createdDate;

    public static PersonalProjectRepoReadResponse of(PersonalProject project) {
        return PersonalProjectRepoReadResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .createdDate(project.getCreatedDate())
                .build();
    }
}
