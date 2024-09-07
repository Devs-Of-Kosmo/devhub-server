package team.devs.devhub.domain.team.domain.team.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface UserTeamRepository extends JpaRepository<UserTeam, Long> {

    @Query("select ut from UserTeam ut join fetch ut.team where ut.user = :user")
    List<UserTeam> findAllByUserFetchJoinTeam(@Param("user") User user);

    @Query("select ut from UserTeam ut join fetch ut.user join fetch ut.team where ut.team = :team")
    List<UserTeam> findAllByTeamFetchJoinUserAndTeam(@Param("team") Team team);

    boolean existsByUserAndTeam(User user, Team team);

    @Query("select case when count(ut) > 0 then true else false end " +
            "from UserTeam ut join ut.user u where ut.team = :team and u.email = :email")
    boolean existsEmailByTeamJoinUser(@Param("team") Team team, @Param("email") String email);

    Optional<UserTeam> findByUserAndTeam(User user, Team team);
}
