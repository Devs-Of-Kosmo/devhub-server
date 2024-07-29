package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectMetaReadResponse {

    private Long projectId;
    private String projectName;
    private String description;
    private List<CommitInfoResponse> commitInfo;

    public static PersonalProjectMetaReadResponse of(PersonalProject project) {
        return PersonalProjectMetaReadResponse.builder()
                .projectId(project.getId())
                .projectName(project.getName())
                .description(project.getDescription())
                .commitInfo(
                        project.getPersonalCommits().stream()
                                .filter(e -> !e.isDeleteCondition())
                                .map(e -> CommitInfoResponse.of(e))
                                .collect(Collectors.toList())
                )
                .build();
    }

    @Getter
    @Builder
    @AllArgsConstructor
    private static class CommitInfoResponse {
        private Long commitId;
        private String commitCode;
        private String commitMessage;
        private LocalDateTime createdDate;

        public static CommitInfoResponse of(PersonalCommit commit) {
            return CommitInfoResponse.builder()
                    .commitId(commit.getId())
                    .commitCode(commit.getCommitCode())
                    .commitMessage(commit.getCommitMessage())
                    .createdDate(commit.getCreatedDate())
                    .build();
        }
    }

}
