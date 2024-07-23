package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.User;

@Getter
@Builder
@AllArgsConstructor
public class UserInfoResponse {

    private Long userId;
    private String email;
    private String name;
    private Integer identificationCode;

    public static UserInfoResponse of(User user) {
        return UserInfoResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .identificationCode(user.getIdentificationCode())
                .build();
    }
}
