package team.devs.devhub.domain.board.domain.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.board.domain.domain.Board;
import team.devs.devhub.domain.board.domain.dto.BoardRequest;
import team.devs.devhub.domain.board.domain.dto.BoardResponse;
import team.devs.devhub.domain.board.domain.repository.BoardRepository;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.security.CustomUserDetails;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BoardService {

    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private static final Logger logger = LoggerFactory.getLogger(BoardService.class);
    private static final String IMAGE_DIR = "/path/to/image/directory"; // 이미지 저장 경로

    public List<BoardResponse> findAll() {
        logger.info("Finding all boards");
        return boardRepository.findAll().stream()
                .map(BoardResponse::of)
                .collect(Collectors.toList());
    }

    public BoardResponse findById(Long id) {
        logger.info("Finding board by ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found with id: " + id));
        return BoardResponse.of(board);
    }

    public List<BoardResponse> findByTitleContaining(String keyword) {
        logger.info("Finding boards by title containing: {}", keyword);
        return boardRepository.findByTitleContaining(keyword).stream()
                .map(BoardResponse::of)
                .collect(Collectors.toList());
    }

    public BoardResponse save(BoardRequest boardRequest, CustomUserDetails customUserDetails) {
        User writer = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        String imagePath = saveImage(boardRequest.getImage());

        Board board = boardRequest.toEntity(writer, imagePath);
        board = boardRepository.save(board);
        return BoardResponse.of(board);
    }

    public BoardResponse update(Long id, BoardRequest updatedBoardRequest, CustomUserDetails customUserDetails) {
        logger.info("Updating board with ID: {}", id);
        Board existingBoard = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found with id: " + id));

        User writer = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        String imagePath = updatedBoardRequest.getImage() != null ? saveImage(updatedBoardRequest.getImage()) : existingBoard.getImagePath();

        existingBoard.updateBoard(updatedBoardRequest.getTitle(), updatedBoardRequest.getContent(), imagePath);
        existingBoard.setWriter(writer);

        existingBoard = boardRepository.save(existingBoard);
        return BoardResponse.of(existingBoard);
    }

    public void deleteById(Long id) {
        logger.info("Deleting board with ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Board not found with id: " + id));
        boardRepository.delete(board);
    }

    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        try {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            File dest = new File(IMAGE_DIR, fileName);
            image.transferTo(dest);
            return "/images/" + fileName; // 저장된 이미지의 경로
        } catch (IOException e) {
            logger.error("Failed to save image", e);
            throw new RuntimeException("Failed to save image", e);
        }
    }
}
