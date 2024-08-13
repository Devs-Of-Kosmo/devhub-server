package team.devs.devhub.domain.team.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.user.domain.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Builder
@AllArgsConstructor
public class TeamDetailsReadResponse {

    private Long teamId;
    private String teamName;
    private String description;
    private boolean deleteCondition;
    private List<AffiliatedUserResponse> members;
    private LocalDateTime createdDate;

    public static TeamDetailsReadResponse of(List<UserTeam> userTeamList) {
        Team team = userTeamList.get(0).getTeam();
        return TeamDetailsReadResponse.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .description(team.getDescription())
                .deleteCondition(team.isDeleteCondition())
                .members(userTeamList.stream()
                        .map(e -> AffiliatedUserResponse.of(e))
                        .collect(Collectors.toList())
                )
                .createdDate(team.getCreatedDate())
                .build();
    }

    @Getter
    @Builder
    @AllArgsConstructor
    private static class AffiliatedUserResponse {

        private Long userId;
        private String email;
        private String userName;
        private Integer identification;
        private TeamRole role;

        private static AffiliatedUserResponse of(UserTeam userTeam) {
            User user = userTeam.getUser();
            return AffiliatedUserResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .userName(user.getName())
                    .identification(user.getIdentificationCode())
                    .role(userTeam.getRole())
                    .build();
        }

    }

}
