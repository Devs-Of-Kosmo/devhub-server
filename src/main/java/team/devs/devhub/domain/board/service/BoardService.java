package team.devs.devhub.domain.board.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.board.domain.Board;
import team.devs.devhub.domain.board.dto.BoardRequest;
import team.devs.devhub.domain.board.dto.BoardResponse;
import team.devs.devhub.domain.board.exception.BoardDeletionException;
import team.devs.devhub.domain.board.exception.BoardNotFoundException;
import team.devs.devhub.domain.board.exception.BoardUpdateException;
import team.devs.devhub.domain.board.exception.ImageSaveFailedException;
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

    @Value("${file.upload.path}")
    private String uploadDir;

    public List<BoardResponse> findAll() {
        logger.info("Finding all boards");
        return boardRepository.findAll().stream()
                .map(BoardResponse::of)
                .collect(Collectors.toList());
    }

    public BoardResponse findById(Long id) {
        logger.info("Finding board by ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException(ErrorCode.BOARD_NOT_FOUND));
        return BoardResponse.of(board);
    }

    public List<BoardResponse> findByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        List<Board> boards = boardRepository.findByWriter(user);
        return boards.stream().map(BoardResponse::of).collect(Collectors.toList());
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

        String imagePath = saveImage(boardRequest.getFile());

        Board board = boardRequest.toEntity(writer, imagePath);
        board = boardRepository.save(board);
        return BoardResponse.of(board);
    }

    public BoardResponse update(Long id, BoardRequest updatedBoardRequest, CustomUserDetails customUserDetails) {
        logger.info("Updating board with ID: {}", id);
        Board existingBoard = boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException(ErrorCode.BOARD_NOT_FOUND));

        User writer = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        String imagePath = updatedBoardRequest.getFile() != null ? saveImage(updatedBoardRequest.getFile()) : existingBoard.getImagePath();

        try {
            existingBoard.updateBoard(updatedBoardRequest.getTitle(), updatedBoardRequest.getContent(), imagePath);
            existingBoard.setWriter(writer);

            existingBoard = boardRepository.save(existingBoard);
        } catch (Exception e) {
            throw new BoardUpdateException(ErrorCode.BOARD_UPDATE);
        }

        return BoardResponse.of(existingBoard);
    }

    public void deleteById(Long id, CustomUserDetails customUserDetails) {
        logger.info("Deleting board with ID: {}", id);
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new BoardNotFoundException(ErrorCode.BOARD_NOT_FOUND));

        if (!board.getWriter().getId().equals(customUserDetails.getId())) {
            throw new BoardDeletionException(ErrorCode.BOARD_DELETE);
        }

        try {
            boardRepository.delete(board);
        } catch (Exception e) {
            throw new BoardDeletionException(ErrorCode.BOARD_DELETE);
        }
    }

    private String saveImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return null;
        }
        try {
            String fileName = UUID.randomUUID().toString() + "_" + image.getOriginalFilename();
            File dest = new File(uploadDir, fileName);
            if (!dest.getParentFile().exists()) {
                dest.getParentFile().mkdirs(); // 디렉토리가 존재하지 않으면 생성
            }
            image.transferTo(dest);
            return "/images/" + fileName;
        } catch (IOException e) {
            logger.error("Failed to save image", e);
            throw new ImageSaveFailedException(ErrorCode.IMAGE_SAVE);
        }
    }
}
