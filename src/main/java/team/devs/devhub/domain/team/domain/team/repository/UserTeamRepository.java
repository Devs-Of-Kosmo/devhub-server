package team.devs.devhub.domain.team.domain.team.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.team.domain.team.UserTeam;

public interface UserTeamRepository extends JpaRepository<UserTeam, Long> {
}
