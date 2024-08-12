package team.devs.devhub.domain.board.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.board.dto.BoardRequest;
import team.devs.devhub.domain.board.dto.BoardResponse;
import team.devs.devhub.domain.board.service.BoardService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
@Tag(name = "게시글 관련 api", description = "게시글 관련 api 입니다")
public class BoardController {

    private final BoardService boardService;

    // 키워드가 있는 경우
    @GetMapping("/public/search")
    @Operation(summary = "게시글 검색 API", description = "파라미터로 keyword를 담아 요청하고, 해당 키워드를 포함한 게시글 목록을 리스트 형식으로 받는다")
    public ResponseEntity<List<BoardResponse>> searchByKeyword(@RequestParam("keyword") String keyword) {
        List<BoardResponse> boardDtoList = boardService.findByTitleContaining(keyword);
        return ResponseEntity.ok(boardDtoList);
    }

    // 키워드가 없는 경우 (전체 조회)
    @GetMapping("/public")
    @Operation(summary = "게시글 전체 조회 API", description = "별도의 파라미터 없이 요청하고, 모든 게시글 목록을 리스트 형식으로 받는다")
    public ResponseEntity<List<BoardResponse>> listAll() {
        List<BoardResponse> boardDtoList = boardService.findAll();
        return ResponseEntity.ok(boardDtoList);
    }


    // 내 게시글 목록 조회
    @GetMapping("/myboards/{userId}")
    @Operation(summary = "유저의 게시글 목록 조회 API", description = "경로에 userId를 담아 요청하고, 해당 유저가 작성한 모든 게시글 목록을 리스트 형식으로 받는다")
    public ResponseEntity<List<BoardResponse>> myBoards(@PathVariable("userId") Long userId) {
        List<BoardResponse> myBoardDtoList = boardService.findByUserId(userId);
        return ResponseEntity.ok(myBoardDtoList);
    }



    // 게시글 상세 조회
    @GetMapping("/{id}")
    @Operation(summary = "게시글 상세 조회 API ", description = "경로에 게시글의 id를 담아 요청하고, 해당 게시글의 상세 정보를 받는다")
    public ResponseEntity<BoardResponse> viewBoard(@PathVariable("id") Long id) {
        BoardResponse boardDto = boardService.findById(id);
        return ResponseEntity.ok(boardDto);
    }

    // 게시글 생성
    @PostMapping
    @Operation(summary = "게시글 생성 API", description = "header에 accessToken을 담고, body에 게시글 데이터를 담아 요청을하여 게시글을 생성하고, 생성된 게시글 정보를 받는다")
    public ResponseEntity<BoardResponse> createBoard(@ModelAttribute BoardRequest boardRequest,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        BoardResponse boardResponse = boardService.save(boardRequest, customUserDetails);
        return ResponseEntity.ok(boardResponse);
    }

    // 게시글 수정
    @PutMapping("/{id}")
    @Operation(summary = "게시글 수정 API", description = "header에 accessToken을 담고, 경로에 게시글의 id를 담아 요청하여 게시글을 수정하고, 수정된 게시글의 정보를 받는다")
    public ResponseEntity<BoardResponse> updateBoard(@PathVariable Long id,
                                                     @ModelAttribute BoardRequest boardRequest,
                                                     @AuthenticationPrincipal CustomUserDetails customUserDetails) {

        BoardResponse updatedBoard = boardService.update(id, boardRequest, customUserDetails);
        return ResponseEntity.ok(updatedBoard);
    }

    // 게시글 삭제
    @DeleteMapping("/{id}")
    @Operation(summary = "게시글 삭제 API", description = "header에 accessToken을 담고, 경로에 게시글의 id를 담아 요청하여 게시글을 삭제한다")
    public ResponseEntity<Void> deleteBoard(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails customUserDetails) {
        boardService.deleteById(id, customUserDetails);
        return ResponseEntity.noContent().build();
    }
}
