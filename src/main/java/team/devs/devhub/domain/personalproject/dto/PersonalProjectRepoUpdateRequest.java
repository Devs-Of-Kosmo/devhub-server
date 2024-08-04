package team.devs.devhub.domain.personalproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

@Getter
public class PersonalProjectRepoUpdateRequest {
    
    @NotNull
    private Long projectId;
    
    @NotBlank
    private String changedProjectName;
    
    @NotBlank
    private String changedDescription;
    
    public PersonalProject toEntity() {
        return PersonalProject.builder()
                .name(changedProjectName)
                .description(changedDescription)
                .build();
    }
}
