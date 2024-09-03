package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.TeamBranch;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectBranchReadResponse {

    private Long branchId;
    private String branchName;
    private String creatorName;
    private LocalDateTime createdDate;

    public static TeamProjectBranchReadResponse of(TeamBranch branch) {
        return TeamProjectBranchReadResponse.builder()
                .branchId(branch.getId())
                .branchName(branch.getName())
                .creatorName(branch.getCreatedBy().getName())
                .createdDate(branch.getCreatedDate())
                .build();
    }

}
