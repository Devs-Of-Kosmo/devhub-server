package team.devs.devhub.global.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import team.devs.devhub.global.util.CookieUtil;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class ViewController {

    private final CookieUtil cookieUtil;

    // 로그인 페이지
    @GetMapping("/login")
    public String login(HttpServletResponse response, Model model) {
        if (model.containsAttribute("accessToken") && model.containsAttribute("refreshToken")) {
            String refreshToken = (String) model.getAttribute("refreshToken");
            response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.getCookie(refreshToken).toString());
        }
        return "login";
    }

    // 회원가입 페이지
    @GetMapping("/register")
    public String register() {
        return "register";
    }

    // 비밀번호 재설정 페이지
    @GetMapping("/password-reset")
    public String passwordReset() {
        return "password-reset";
    }

    // 연락처 페이지
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    // 테스트 페이지
    @GetMapping("/test")
    public String test() {
        return "test";
    }

    // 데이터 전송 (Flask 서버로)
    @PostMapping("/send-data")
    public ResponseEntity<String> sendDataToFlask(@RequestBody Map<String, String> data) {
        String flaskUrl = "http://127.0.0.1:5000/";
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(flaskUrl, data, String.class);
        return response;
    }

    // 로딩 페이지
    @GetMapping("/loading")
    public String loadingPage() {
        return "loading";
    }

    // 개인 프로젝트 페이지
    @GetMapping("/personal_project")
    public String personalProject() {
        return "personal_project";
    }

    // 프로젝트 목록 페이지
    @GetMapping("/project_list")
    public String projectList() {
        return "project_list";
    }

    // 게시글 목록 페이지로 이동
    @GetMapping("/boards")
    public String showBoardsPage() {
        return "board/boards"; // boards.html 파일을 반환
    }

    // 게시글 작성 페이지로 이동
    @GetMapping("/boards/new")
    public String showNewBoardPage() {
        return "board/form"; // form.html 파일을 반환
    }

    // 게시글 상세 페이지로 이동
    @GetMapping("/boards/{id}")
    public String showBoardDetailPage(@PathVariable Long id) {
        return "board/view"; // view.html 파일을 반환
    }
    // 게시글 수정 페이지로 이동
    @GetMapping("/boards/edit/{id}")
    public String showEditBoardPage(@PathVariable Long id) {
        return "board/edit"; // edit.html 파일을 반환
    }
}
