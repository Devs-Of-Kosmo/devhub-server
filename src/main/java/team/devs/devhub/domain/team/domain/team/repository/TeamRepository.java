package team.devs.devhub.domain.team.domain.team.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.team.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {

    boolean existsByName(String name);

}
