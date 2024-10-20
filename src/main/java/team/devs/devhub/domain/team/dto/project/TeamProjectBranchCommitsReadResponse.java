package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamCommit;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectBranchCommitsReadResponse {

    private Long commitId;
    private String commitCode;
    private String commitMessage;
    private String createdBy;
    private LocalDateTime createdDate;

    public static TeamProjectBranchCommitsReadResponse of(TeamCommit commit) {
        return TeamProjectBranchCommitsReadResponse.builder()
                .commitId(commit.getId())
                .commitCode(commit.getCommitCode())
                .commitMessage(commit.getCommitMessage())
                .createdBy(commit.getCreatedBy().getName())
                .createdDate(commit.getCreatedDate())
                .build();
    }
}
