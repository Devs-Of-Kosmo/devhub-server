package team.devs.devhub.domain.personalproject.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;

public interface PersonalCommitRepository extends JpaRepository<PersonalCommit, Long> {
}
