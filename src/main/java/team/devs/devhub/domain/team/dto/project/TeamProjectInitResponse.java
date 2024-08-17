package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectInitResponse {

    private Long newBranchId;
    private String branchName;
    private Long newCommitId;
    private String commitMessage;

    public static TeamProjectInitResponse of(TeamBranch branch, TeamCommit commit) {
        return TeamProjectInitResponse.builder()
                .newBranchId(branch.getId())
                .branchName(branch.getName())
                .newCommitId(commit.getId())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
