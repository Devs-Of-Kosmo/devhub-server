package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class EmailAuthenticationResponse {

    private Boolean verified;

    public static EmailAuthenticationResponse of(boolean verified) {
        return EmailAuthenticationResponse.builder()
                .verified(verified)
                .build();
    }
}
