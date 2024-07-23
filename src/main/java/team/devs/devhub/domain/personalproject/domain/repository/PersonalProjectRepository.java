package team.devs.devhub.domain.personalproject.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.user.domain.User;

public interface PersonalProjectRepository extends JpaRepository<PersonalProject, Long> {

    boolean existsByMasterAndName(User master, String name);
}
