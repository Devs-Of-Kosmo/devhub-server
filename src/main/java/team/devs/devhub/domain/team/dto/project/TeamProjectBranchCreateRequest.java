package team.devs.devhub.domain.team.dto.project;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.user.domain.User;

@Getter
public class TeamProjectBranchCreateRequest {

    @NotNull
    @Schema(description = "브랜치를 생성하는 프로젝트의 id", example = "1")
    private Long projectId;
    @NotNull
    @Schema(description = "브랜치가 파생되는 특정 커밋의 id", example = "1")
    private Long fromCommitId;
    @NotBlank
    @Schema(description = "생성하는 브랜치의 이름", example = "브랜치1")
    private String branchName;
    @NotNull
    @Schema(description = "생성하는 브랜치의 설명 (할 일 같은 거 쓰는 용도)", example = "OO 기능 구현")
    private String description;

    public TeamBranch toEntity(User user, TeamProject project, TeamCommit fromCommit) {
        return TeamBranch.builder()
                .name(branchName)
                .description(description)
                .project(project)
                .fromCommit(fromCommit)
                .createdBy(user)
                .build();
    }
}
