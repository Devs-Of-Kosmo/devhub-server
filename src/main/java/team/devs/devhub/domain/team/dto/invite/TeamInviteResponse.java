package team.devs.devhub.domain.team.dto.invite;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TeamInviteResponse {

    private String invitedEmail;
    private String code;

    public static TeamInviteResponse of(String invitedEmail, String code) {
        return TeamInviteResponse.builder()
                .invitedEmail(invitedEmail)
                .code(code)
                .build();
    }
}
