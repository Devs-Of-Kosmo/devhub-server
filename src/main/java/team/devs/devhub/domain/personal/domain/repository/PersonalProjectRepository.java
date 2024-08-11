package team.devs.devhub.domain.personal.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.user.domain.User;

import java.util.List;
import java.util.Optional;

public interface PersonalProjectRepository extends JpaRepository<PersonalProject, Long> {

    boolean existsByMasterAndName(User master, String name);
    List<PersonalProject> findAllByMaster(User master);

    @Query("select p from PersonalProject p join fetch p.personalCommits where p.id = :projectId")
    Optional<PersonalProject> findByIdFetchJoinCommits(@Param("projectId") long projectId);

}
