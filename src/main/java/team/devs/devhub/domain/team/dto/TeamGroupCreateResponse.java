package team.devs.devhub.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;

@Getter
@Builder
@AllArgsConstructor
public class TeamGroupCreateResponse {

    private Long newTeamId;
    private String teamName;
    private String description;

    public static TeamGroupCreateResponse of(Team team) {
        return TeamGroupCreateResponse.builder()
                .newTeamId(team.getId())
                .teamName(team.getName())
                .description(team.getDescription())
                .build();
    }
}
