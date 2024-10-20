package team.devs.devhub.domain.team.dto.invite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;

@Getter
@Builder
@AllArgsConstructor
public class TeamJoinResponse {
    private Long joinUserId;
    private Long joinTeamId;
    private TeamRole userRoleInTeam;

    public static TeamJoinResponse of(UserTeam userTeam) {
        return TeamJoinResponse.builder()
                .joinUserId(userTeam.getUser().getId())
                .joinTeamId(userTeam.getTeam().getId())
                .userRoleInTeam(userTeam.getRole())
                .build();
    }
}
