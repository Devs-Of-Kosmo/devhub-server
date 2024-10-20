package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectCommitReadResponse {

    private List<String> fileNameWithPathList;

    public static TeamProjectCommitReadResponse of(List<String> fileNameWithPathList) {
        return TeamProjectCommitReadResponse.builder()
                .fileNameWithPathList(fileNameWithPathList)
                .build();
    }
}
