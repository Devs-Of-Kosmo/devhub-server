package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectSaveResponse {

    private Long newCommitId;
    private String newCommitMessage;
    private Long branchId;
    private Long createdBy;

    public static TeamProjectSaveResponse of(TeamCommit commit) {
        return TeamProjectSaveResponse.builder()
                .newCommitId(commit.getId())
                .newCommitMessage(commit.getCommitMessage())
                .branchId(commit.getBranch().getId())
                .createdBy(commit.getCreatedBy().getId())
                .build();
    }
}
