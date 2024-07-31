package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectSaveResponse {

    private Long newCommitId;
    private Long projectId;
    private Long masterId;
    private String parentCommitCode;
    private String commitMessage;

    public static PersonalProjectSaveResponse of(PersonalCommit commit) {
        return PersonalProjectSaveResponse.builder()
                .newCommitId(commit.getId())
                .projectId(commit.getProject().getId())
                .masterId(commit.getMaster().getId())
                .parentCommitCode(commit.getParentCommitCode())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
