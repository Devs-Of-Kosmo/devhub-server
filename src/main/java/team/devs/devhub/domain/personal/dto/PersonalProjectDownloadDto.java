package team.devs.devhub.domain.personal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.core.io.ByteArrayResource;
import team.devs.devhub.domain.personal.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectDownloadDto {

    private ByteArrayResource resource;
    private String projectName;

    public static PersonalProjectDownloadDto of(ByteArrayResource resource, PersonalCommit commit) {
        return PersonalProjectDownloadDto.builder()
                .resource(resource)
                .projectName(commit.getProject().getName())
                .build();
    }
}
