package team.devs.devhub.domain.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.User;

@Getter
@Builder
@AllArgsConstructor
public class CommonUserResponse {

    private Long id;
    private String email;
    private String name;
    private Integer identificationCode;

    public static CommonUserResponse of(User user) {
        return CommonUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .identificationCode(user.getIdentificationCode())
                .build();
    }
}
