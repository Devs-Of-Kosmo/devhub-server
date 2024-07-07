package team.devs.devhub.domain.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.RoleType;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.DeleteCondition;

@Getter
public class SignupRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    @NotBlank
    private String name;

    public User toEntity() {
        return User.builder()
                .email(email)
                .password(password)
                .name(name)
                .roleType(RoleType.USER)
                .deleteCondition(DeleteCondition.N)
                .build();
    }
}
