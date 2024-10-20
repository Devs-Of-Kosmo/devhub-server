package team.devs.devhub.domain.team.dto.project;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import team.devs.devhub.domain.team.domain.project.MergeCondition;
import team.devs.devhub.domain.team.domain.project.TeamBranch;

@Getter
@Builder
@AllArgsConstructor
public class TeamProjectBranchMergeSuggestResponse {

    private Long branchId;
    private MergeCondition mergeCondition;

    public static TeamProjectBranchMergeSuggestResponse of(TeamBranch branch) {
        return TeamProjectBranchMergeSuggestResponse.builder()
                .branchId(branch.getId())
                .mergeCondition(branch.getCondition())
                .build();
    }
}
