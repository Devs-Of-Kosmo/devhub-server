package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectInitResponse {

    private Long personalCommitId;
    private Long personalProjectId;
    private Long masterId;
    private String commitMessage;

    public static PersonalProjectInitResponse of(PersonalCommit commit) {
        return PersonalProjectInitResponse.builder()
                .personalCommitId(commit.getId())
                .personalProjectId(commit.getProject().getId())
                .masterId(commit.getMaster().getId())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
