package team.devs.devhub.domain.board.domain.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.board.domain.dto.BoardRequest;
import team.devs.devhub.domain.board.domain.dto.BoardResponse;
import team.devs.devhub.domain.board.domain.service.BoardService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardRestController {

    private final BoardService boardService;

    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@RequestPart BoardRequest boardRequest,
                                                     @RequestPart(required = false) MultipartFile image,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        boardRequest.setImage(image);
        return ResponseEntity.ok(boardService.save(boardRequest, customUserDetails));
    }

    @GetMapping
    public ResponseEntity<List<BoardResponse>> getAllBoards() {
        return ResponseEntity.ok(boardService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> getBoardById(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> updateBoard(@PathVariable Long id,
                                                     @RequestPart BoardRequest boardRequest,
                                                     @RequestPart(required = false) MultipartFile image,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        boardRequest.setImage(image);
        return ResponseEntity.ok(boardService.update(id, boardRequest, customUserDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id) {
        boardService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<BoardResponse>> searchBoards(@RequestParam String keyword) {
        return ResponseEntity.ok(boardService.findByTitleContaining(keyword));
    }
}
