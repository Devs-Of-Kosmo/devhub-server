package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectSaveResponse {

    private Long personalCommitId;
    private Long personalProjectId;
    private Long masterId;
    private String parentCommitCode;
    private String commitMessage;

    public static PersonalProjectSaveResponse of(PersonalCommit commit) {
        return PersonalProjectSaveResponse.builder()
                .personalCommitId(commit.getId())
                .personalProjectId(commit.getProject().getId())
                .masterId(commit.getMaster().getId())
                .parentCommitCode(commit.getParentCommitCode())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
