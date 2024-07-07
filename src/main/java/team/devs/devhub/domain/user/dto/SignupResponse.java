package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.User;

@Getter
@Builder
@AllArgsConstructor
public class SignupResponse {

    private Long id;

    public static SignupResponse of(User user) {
        return SignupResponse.builder()
                .id(user.getId())
                .build();
    }
}
