package team.devs.devhub.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;

@Getter
@Builder
@AllArgsConstructor
public class TeamGroupUpdateResponse {

    private Long teamId;
    private String nameAfterChange;
    private String descriptionAfterChange;

    public static TeamGroupUpdateResponse of(Team team) {
        return TeamGroupUpdateResponse.builder()
                .teamId(team.getId())
                .nameAfterChange(team.getName())
                .descriptionAfterChange(team.getDescription())
                .build();
    }
}
