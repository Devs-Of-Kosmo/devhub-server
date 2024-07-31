package team.devs.devhub.domain.board.domain.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.board.domain.domain.repository.BoardRepository;
import team.devs.devhub.domain.board.domain.dto.BoardDto;
import team.devs.devhub.domain.board.domain.entity.Board;


import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);

    @Autowired
    public BoardService(BoardRepository boardRepository) {
        this.boardRepository = boardRepository;
    }

    public List<BoardDto> findAll() {
        logger.info("Finding all boards");
        return boardRepository.findAll().stream()
                .map(BoardDto::new)
                .collect(Collectors.toList());
    }

    public BoardDto findById(Long id) {
        logger.info("Finding board by ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found with id: " + id));
        return new BoardDto(board);
    }

    public List<BoardDto> findByTitleContaining(String keyword) {
        logger.info("Finding boards by title containing: {}", keyword);
        return boardRepository.findByTitleContaining(keyword).stream()
                .map(BoardDto::new)
                .collect(Collectors.toList());
    }

    public BoardDto save(BoardDto boardDto) {
        if (boardDto.getCreateDate() == null) {
            boardDto.setCreateDate(LocalDateTime.now());
        }
        Board board = boardDto.toEntity();
        board = boardRepository.save(board);
        return new BoardDto(board);
    }

    public BoardDto update(Long id, BoardDto updatedBoardDto) {
        logger.info("Updating board with ID: {}", id);
        Board existingBoard = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found with id: " + id));
        existingBoard.setTitle(updatedBoardDto.getTitle());
        existingBoard.setContent(updatedBoardDto.getContent());
        existingBoard.setWriter(updatedBoardDto.getWriter());
        existingBoard.setCreateDate(updatedBoardDto.getCreateDate());
        existingBoard.setImagePath(updatedBoardDto.getImagePath());
        existingBoard = boardRepository.save(existingBoard);
        return new BoardDto(existingBoard);
    }

    public void deleteById(Long id) {
        logger.info("Deleting board with ID: {}", id);
        if (!boardRepository.existsById(id)) {
            throw new IllegalArgumentException("Board not found with id: " + id);
        }
        boardRepository.deleteById(id);
    }
}
