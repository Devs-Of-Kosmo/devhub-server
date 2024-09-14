package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectBranchMergeResponse {
    private Long newCommitId;
    private String newCommitMessage;
    private Long mergedBranchId;
    private Long createdBy;

    public static TeamProjectBranchMergeResponse of(TeamCommit commit) {
        return TeamProjectBranchMergeResponse.builder()
                .newCommitId(commit.getId())
                .newCommitMessage(commit.getCommitMessage())
                .mergedBranchId(commit.getBranch().getId())
                .createdBy(commit.getCreatedBy().getId())
                .build();
    }
}
