package team.devs.devhub.domain.team.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;

@Getter
@Builder
@AllArgsConstructor
public class TeamGroupReadResponse {

    private Long teamId;
    private String teamName;
    private boolean deleteCondition;

    public static TeamGroupReadResponse of(Team team) {
        return TeamGroupReadResponse.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .deleteCondition(team.isDeleteCondition())
                .build();
    }
}
