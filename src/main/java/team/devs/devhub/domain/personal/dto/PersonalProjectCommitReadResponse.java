package team.devs.devhub.domain.personal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class PersonalProjectCommitReadResponse {

    private List<String> fileNameWithPathList;

    public static PersonalProjectCommitReadResponse of(List<String> fileNameWithPathList) {
        return PersonalProjectCommitReadResponse.builder()
                .fileNameWithPathList(fileNameWithPathList)
                .build();
    }
}
