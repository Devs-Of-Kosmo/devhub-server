package team.devs.devhub.domain.personalproject.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectInitResponse {

    private Long newCommitId;
    private Long projectId;
    private Long masterId;
    private String commitMessage;

    public static PersonalProjectInitResponse of(PersonalCommit commit) {
        return PersonalProjectInitResponse.builder()
                .newCommitId(commit.getId())
                .projectId(commit.getProject().getId())
                .masterId(commit.getMaster().getId())
                .commitMessage(commit.getCommitMessage())
                .build();
    }
}
