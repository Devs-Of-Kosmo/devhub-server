package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;
import team.devs.devhub.domain.team.domain.project.TeamProject;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectMetaReadResponse {

    private Long projectId;
    private String projectName;
    private String description;
    private List<DefaultBranchCommitInfoResponse> commitInfo;

    public static TeamProjectMetaReadResponse of(TeamProject project, TeamBranch defaultBranch) {
        return TeamProjectMetaReadResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .commitInfo(
                        defaultBranch.getCommits().stream()
                                .map(e -> DefaultBranchCommitInfoResponse.of(e))
                                .collect(Collectors.toList())
                )
                .build();
    }

    @Getter
    @Builder
    @AllArgsConstructor
    private static class DefaultBranchCommitInfoResponse {
        private Long commitId;
        private String commitCode;
        private String commitMessage;
        private String createdBy;
        private LocalDateTime createdDate;

        private static DefaultBranchCommitInfoResponse of(TeamCommit commit) {
            return DefaultBranchCommitInfoResponse.builder()
                    .commitId(commit.getId())
                    .commitCode(commit.getCommitCode())
                    .commitMessage(commit.getCommitMessage())
                    .createdBy(commit.getCreatedBy().getName())
                    .createdDate(commit.getCreatedDate())
                    .build();
        }
    }
}
