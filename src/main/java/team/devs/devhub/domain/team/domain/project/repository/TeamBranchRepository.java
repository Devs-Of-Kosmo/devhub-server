package team.devs.devhub.domain.team.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.project.MergeCondition;
import team.devs.devhub.domain.team.domain.project.TeamBranch;

import java.util.List;
import java.util.Optional;

public interface TeamBranchRepository extends JpaRepository<TeamBranch, Long> {

    Optional<TeamBranch> findFirstByProjectIdOrderByIdAsc(long projectId);
    List<TeamBranch> findAllByFromCommitId(long fromCommitId);
    boolean existsByProjectIdAndName(long projectId, String name);
    List<TeamBranch> findAllByProjectIdAndConditionOrderByLastModifiedDateDesc(long projectId, MergeCondition Condition);
}
