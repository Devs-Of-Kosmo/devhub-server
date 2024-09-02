package team.devs.devhub.domain.team.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.project.TeamBranch;

import java.util.Optional;

public interface TeamBranchRepository extends JpaRepository<TeamBranch, Long> {

    Optional<TeamBranch> findFirstByProjectIdOrderByIdAsc(long projectId);
    boolean existsByProjectIdAndName(long projectId, String name);
}
