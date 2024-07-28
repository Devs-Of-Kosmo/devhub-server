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

    public static PersonalProjectSaveResponse of(PersonalCommit personalCommit, String commitMessage) {
        return PersonalProjectSaveResponse.builder()
                .personalCommitId(personalCommit.getId())
                .personalProjectId(personalCommit.getProject().getId())
                .masterId(personalCommit.getMaster().getId())
                .parentCommitCode(personalCommit.getParentCommitCode())
                .commitMessage(commitMessage)
                .build();
    }
}
