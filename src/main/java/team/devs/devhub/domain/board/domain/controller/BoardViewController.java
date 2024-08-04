package team.devs.devhub.domain.board.domain.controller;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import team.devs.devhub.domain.board.domain.dto.BoardRequest;
import team.devs.devhub.domain.board.domain.dto.BoardResponse;
import team.devs.devhub.domain.board.domain.service.BoardService;

import java.util.List;

@Controller
@RequestMapping("/boards")
@RequiredArgsConstructor
public class BoardViewController {

    private final BoardService boardService;
    private static final Logger logger = LoggerFactory.getLogger(BoardViewController.class);

    // 게시물 목록 페이지
    @GetMapping
    public String list(Model model) {
        logger.info("Displaying list of boards");
        List<BoardResponse> boardRequestList = boardService.findAll();
        model.addAttribute("boards", boardRequestList);
        return "board/boards"; // templates/board/boards.html 파일을 렌더링
    }

    // 게시글 상세보기 컨트롤러 메서드
    @GetMapping("/{id}")
    public String viewBoard(@PathVariable("id") Long id, Model model) {
        logger.info("Displaying board details for board id: {}", id);
        BoardResponse boardResponse = boardService.findById(id);
        model.addAttribute("board", boardResponse);
        return "board/view"; // templates/board/view.html 파일을 렌더링
    }

    // 게시물 작성 폼 페이지
    @GetMapping("/new")
    public String createForm(Model model) {
        logger.info("Displaying create board form");
        model.addAttribute("board", new BoardRequest());
        return "board/form"; // templates/board/form.html 파일을 렌더링 (작성 폼)
    }

    // 게시물 수정 폼 페이지
    @GetMapping("/edit/{id}")
    public String editForm(@PathVariable("id") Long id, Model model) {
        logger.info("Displaying edit board form for board id: {}", id);
        BoardResponse boardResponse = boardService.findById(id);
        model.addAttribute("board", boardResponse);
        return "board/form"; // templates/board/form.html 파일을 렌더링 (수정 폼)
    }

    // 게시물 삭제 확인 페이지
    @GetMapping("/delete/{id}")
    public String deleteConfirm(@PathVariable("id") Long id, Model model) {
        logger.info("Displaying delete confirmation for board id: {}", id);
        BoardResponse boardResponse = boardService.findById(id);
        model.addAttribute("board", boardResponse);
        return "board/delete"; // templates/board/delete.html 파일을 렌더링 (삭제 확인)
    }
}
