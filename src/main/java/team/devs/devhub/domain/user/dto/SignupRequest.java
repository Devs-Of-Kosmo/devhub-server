package team.devs.devhub.domain.user.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import team.devs.devhub.domain.user.domain.RoleType;
import team.devs.devhub.domain.user.domain.User;

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
                .build();
    }
}
