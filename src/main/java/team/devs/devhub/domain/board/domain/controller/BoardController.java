package team.devs.devhub.domain.board.domain.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.board.domain.dto.BoardRequest;
import team.devs.devhub.domain.board.domain.dto.BoardResponse;
import team.devs.devhub.domain.board.domain.service.BoardService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // 키워드가 있는 경우
    @GetMapping("/public/search")
    public ResponseEntity<List<BoardResponse>> searchByKeyword(@RequestParam("keyword") String keyword) {
        List<BoardResponse> boardDtoList = boardService.findByTitleContaining(keyword);
        return ResponseEntity.ok(boardDtoList);
    }

    // 키워드가 없는 경우 (전체 조회)
    @GetMapping("/public")
    public ResponseEntity<List<BoardResponse>> listAll() {
        List<BoardResponse> boardDtoList = boardService.findAll();
        return ResponseEntity.ok(boardDtoList);
    }


    // 내 게시글 목록 조회
    @GetMapping("/myboards/{userId}")
    public ResponseEntity<List<BoardResponse>> myBoards(@PathVariable("userId") Long userId) {
        List<BoardResponse> myBoardDtoList = boardService.findByUserId(userId);
        return ResponseEntity.ok(myBoardDtoList);
    }



    // 게시글 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<BoardResponse> viewBoard(@PathVariable("id") Long id) {
        BoardResponse boardDto = boardService.findById(id);
        return ResponseEntity.ok(boardDto);
    }

    // 게시글 생성
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(@ModelAttribute BoardRequest boardRequest,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        BoardResponse boardResponse = boardService.save(boardRequest, customUserDetails);
        return ResponseEntity.ok(boardResponse);
    }

    // 게시글 수정
    @PutMapping("/{id}")
    public ResponseEntity<BoardResponse> updateBoard(@PathVariable Long id,
                                                     @ModelAttribute BoardRequest boardRequest,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        BoardResponse updatedBoard = boardService.update(id, boardRequest, customUserDetails);
        return ResponseEntity.ok(updatedBoard);
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        boardService.deleteById(id, customUserDetails);
        return ResponseEntity.noContent().build();
    }
}
