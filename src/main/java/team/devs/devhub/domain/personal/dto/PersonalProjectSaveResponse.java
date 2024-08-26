package team.devs.devhub.domain.personal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personal.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectSaveResponse {

    private Long newCommitId;
    private Long projectId;
    private Long masterId;
    private Long parentCommitId;
    private String commitMessage;

    public static PersonalProjectSaveResponse of(PersonalCommit commit) {
        return PersonalProjectSaveResponse.builder()
                .newCommitId(commit.getId())
                .projectId(commit.getProject().getId())
                .masterId(commit.getMaster().getId())
                .parentCommitId(commit.getParentCommit().getId())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
