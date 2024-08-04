package team.devs.devhub.domain.board.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import team.devs.devhub.domain.board.domain.domain.Board;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByTitleContaining(String keyword);
}
