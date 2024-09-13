package team.devs.devhub.domain.team.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class TeamProjectBranchMergeRequest {

    @NotNull
    @Schema(description = "병합될 브랜치의 id (main 브랜치)", example = "1")
    private Long mergeBranchId;
    @NotNull
    @Schema(description = "병합될 브랜치의 가장 최근 커밋 id", example = "1")
    private Long mergeBranchLastCommitId;
    @NotNull
    @Schema(description = "병합을 요청한 브랜치의 id", example = "2")
    private Long branchId;
}
