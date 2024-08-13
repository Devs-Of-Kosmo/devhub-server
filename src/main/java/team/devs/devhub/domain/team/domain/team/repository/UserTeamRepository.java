package team.devs.devhub.domain.team.domain.team.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.user.domain.User;

import java.util.List;

public interface UserTeamRepository extends JpaRepository<UserTeam, Long> {

    @Query("select ut from UserTeam ut join fetch ut.team where ut.user = :user")
    List<UserTeam> findAllByUser(@Param("user") User user);

    @Query("select ut from UserTeam ut join fetch ut.user join fetch ut.team where ut.team = :team")
    List<UserTeam> findAllByTeam(@Param("team") Team team);

    boolean existsByUserAndTeam(User user, Team team);
}
