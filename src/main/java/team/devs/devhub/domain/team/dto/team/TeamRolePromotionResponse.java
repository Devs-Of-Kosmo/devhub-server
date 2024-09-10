package team.devs.devhub.domain.team.dto.team;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;

@Getter
@Builder
@AllArgsConstructor
public class TeamRolePromotionResponse {

    private Long targetUserId;
    private TeamRole currentRole;

    public static TeamRolePromotionResponse of(UserTeam userTeam) {
        return TeamRolePromotionResponse.builder()
                .targetUserId(userTeam.getUser().getId())
                .currentRole(userTeam.getRole())
                .build();
    }
}
