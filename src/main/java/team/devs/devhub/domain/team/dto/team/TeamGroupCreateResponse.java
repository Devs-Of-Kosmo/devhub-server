package team.devs.devhub.domain.team.dto.team;

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
    private Long createdBy;

    public static TeamGroupCreateResponse of(Team team) {
        return TeamGroupCreateResponse.builder()
                .newTeamId(team.getId())
                .teamName(team.getName())
                .description(team.getDescription())
                .createdBy(team.getCreatedBy().getId())
                .build();
    }
}
