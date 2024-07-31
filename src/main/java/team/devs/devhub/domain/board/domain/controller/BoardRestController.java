package team.devs.devhub.domain.board.domain.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.board.domain.dto.BoardDto;
import team.devs.devhub.domain.board.domain.service.BoardService;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/boards")
public class BoardRestController {

    @Autowired
    private BoardService boardService;

    @Value("${file.upload.path}")
    private String uploadDir;

    private static final Logger logger = LoggerFactory.getLogger(BoardRestController.class);

    @GetMapping("/search")
    public ResponseEntity<List<BoardDto>> search(@RequestParam(name = "keyword", required = false) String keyword) {
        logger.info("Searching boards with keyword: {}", keyword);
        if (keyword != null && !keyword.isEmpty()) {
            List<BoardDto> boardDto = boardService.findByTitleContaining(keyword);
            return new ResponseEntity<>(boardDto, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<List<BoardDto>> list() {
        logger.info("Listing all boards");
        List<BoardDto> boardDto = boardService.findAll();
        return new ResponseEntity<>(boardDto, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDto> view(@PathVariable("id") Long id) {
        logger.info("Viewing board with ID: {}", id);
        if (id == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        try {
            BoardDto boardDto = boardService.findById(id);
            if (boardDto == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(boardDto, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            logger.error("Error finding board with ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<BoardDto> create(@ModelAttribute BoardDto boardDto, @RequestParam("file") MultipartFile file) {
        logger.info("Creating new board");
        if (!file.isEmpty()) {
            try {
                String fileName = saveFile(file);
                boardDto.setImagePath("/images/" + fileName);
            } catch (IOException e) {
                logger.error("Error saving file", e);
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        boardService.save(boardDto);
        return new ResponseEntity<>(boardDto, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardDto> update(@PathVariable("id") Long id, @ModelAttribute BoardDto boardDto, @RequestParam(value = "file", required = false) MultipartFile file) {
        logger.info("Updating board with ID: {}", id);
        BoardDto existingBoardDto = boardService.findById(id);
        if (existingBoardDto == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        try {
            if (file != null && !file.isEmpty()) {
                String fileName = saveFile(file);
                boardDto.setImagePath("/images/" + fileName);
            } else {
                boardDto.setImagePath(existingBoardDto.getImagePath());
            }
            existingBoardDto.setTitle(boardDto.getTitle());
            existingBoardDto.setContent(boardDto.getContent());
            existingBoardDto.setWriter(boardDto.getWriter());
            existingBoardDto.setCreateDate(boardDto.getCreateDate()); // 수정된 작성일 업데이트
            existingBoardDto.setImagePath(boardDto.getImagePath());
            boardService.update(id, existingBoardDto);
        } catch (IOException e) {
            logger.error("Error updating board with ID: {}", id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity<>(boardDto, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        logger.info("Deleting board with ID: {}", id);
        boardService.deleteById(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<String> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        return new ResponseEntity<>("Invalid board ID format. ID should be a number.", HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        return new ResponseEntity<>("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String saveFile(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);

        if (!Files.exists(filePath.getParent())) {
            Files.createDirectories(filePath.getParent());
        }

        Files.copy(file.getInputStream(), filePath);
        return fileName;
    }
}
