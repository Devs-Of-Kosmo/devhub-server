package team.devs.devhub.domain.personal.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.user.domain.User;

@Getter
public class PersonalProjectRepoCreateRequest {

    @NotBlank
    private String projectName;
    private String description;

    public PersonalProject toEntity(User user) {
        return PersonalProject.builder()
                .name(projectName)
                .description(description)
                .master(user)
                .build();
    }
}
