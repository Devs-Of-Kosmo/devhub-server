package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.core.io.ByteArrayResource;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectDownloadDto {

    private ByteArrayResource resource;
    private String projectName;

    public static TeamProjectDownloadDto of(ByteArrayResource resource, TeamCommit commit) {
        return TeamProjectDownloadDto.builder()
                .resource(resource)
                .projectName(commit.getBranch().getProject().getName())
                .build();
    }
}
