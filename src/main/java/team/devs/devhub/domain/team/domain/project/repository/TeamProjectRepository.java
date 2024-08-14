package team.devs.devhub.domain.team.domain.project.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.project.TeamProject;

import java.util.List;


public interface TeamProjectRepository extends JpaRepository<TeamProject, Long> {

    boolean existsByTeamIdAndName(Long teamId, String name);
    List<TeamProject> findAllByTeamId(Long id);
}
