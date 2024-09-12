package team.devs.devhub.domain.team.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TeamProjectBranchMergeSuggestRequest {

    @NotNull
    @Schema(description = "병합 요청 브랜치 id", example = "1")
    private Long branchId;

}
