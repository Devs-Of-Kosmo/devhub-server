package team.devs.devhub.domain.team.dto.invite;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;

@Getter
public class TeamJoinRequest {

    @NotBlank
    @Schema(description = "암호화 된 초대 코드", example = "fxjtgcgtzeser7855656e45tjdjtstj")
    private String code;
}
