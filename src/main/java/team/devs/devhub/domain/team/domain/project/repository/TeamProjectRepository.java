package team.devs.devhub.domain.team.domain.project.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.devs.devhub.domain.team.domain.project.TeamProject;

import java.util.List;
import java.util.Optional;


public interface TeamProjectRepository extends JpaRepository<TeamProject, Long> {

    boolean existsByTeamIdAndName(Long teamId, String name);
    List<TeamProject> findAllByTeamId(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select tp from TeamProject tp where tp.id = :id")
    Optional<TeamProject> findByIdForSaveProject(@Param("id") Long id);
}
