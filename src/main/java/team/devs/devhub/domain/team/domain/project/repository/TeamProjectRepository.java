package team.devs.devhub.domain.team.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.project.TeamProject;

public interface TeamProjectRepository extends JpaRepository<TeamProject, Long> {

    boolean existsByTeamIdAndName(Long teamId, String name);
}
