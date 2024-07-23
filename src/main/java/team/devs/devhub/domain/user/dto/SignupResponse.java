package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.User;

@Getter
@Builder
@AllArgsConstructor
public class SignupResponse {

    private Long userId;
    private String email;
    private String name;
    private Integer identificationCode;

    public static SignupResponse of(User user) {
        return SignupResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .identificationCode(user.getIdentificationCode())
                .build();
    }
}
