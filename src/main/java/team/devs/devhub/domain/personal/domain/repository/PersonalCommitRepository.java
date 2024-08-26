package team.devs.devhub.domain.personal.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.personal.domain.PersonalCommit;

public interface PersonalCommitRepository extends JpaRepository<PersonalCommit, Long> {
}
