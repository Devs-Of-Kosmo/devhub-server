package team.devs.devhub.domain.team.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.project.TeamBranch;

public interface TeamBranchRepository extends JpaRepository<TeamBranch, Long> {
    boolean existsByProjectIdAndName(long projectId, String name);
}
