package team.devs.devhub.domain.user.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import team.devs.devhub.domain.user.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query("SELECT MAX(identificationCode) FROM User WHERE name = :name")
    Optional<Integer> findMaxIdentificationCodeByName(@Param("name") String name);

    boolean existsByEmail(String email);
}
