package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectBranchCreateResponse {

    private Long newBranchId;
    private String newBranchName;
    private Long newCommitId;
    private String newCommitMessage;
    private Long createdBy;

    public static TeamProjectBranchCreateResponse of(TeamBranch branch, TeamCommit commit) {
        return TeamProjectBranchCreateResponse.builder()
                .newBranchId(branch.getId())
                .newBranchName(branch.getName())
                .newCommitId(commit.getId())
                .newCommitMessage(commit.getCommitMessage())
                .createdBy(branch.getCreatedBy().getId())
                .build();
    }
}
