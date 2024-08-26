package team.devs.devhub.global.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.global.util.CookieUtil;

@Controller
@RequiredArgsConstructor
public class ViewController {

    private final CookieUtil cookieUtil;

    @GetMapping("/login")
    public String login(HttpServletResponse response, Model model) {
        if (model.containsAttribute("accessToken") && model.containsAttribute("refreshToken")) {
            String refreshToken = (String) model.getAttribute("refreshToken");
            response.addHeader(HttpHeaders.SET_COOKIE, cookieUtil.getCookie(refreshToken).toString());
        }
        return "login/login";
    }

    @GetMapping("/register")
    public String register() {
        return "register/register";
    }

    @GetMapping("/password-reset")
    public String passwordReset() {
        return "password-reset";
    }

    @GetMapping("/mypage")
    public String mypage() {
        return "mypage/mypage";
    }

    @GetMapping("/loading")
    public String loadingPage() {
        return "personal_project/loading";
    }

    @GetMapping("/project_list")
    public String projectList() {
        return "personal_project/project_list";
    }

    @GetMapping("/personal_project")
    public String personalProject() {
        return "personal_project/personal_project";
    }

    @GetMapping("/boards")
    public String showBoardsPage() {
        return "board/boards"; // boards.html 파일을 반환
    }

    @GetMapping("/boards/new")
    public String showNewBoardPage() {
        return "board/form"; // form.html 파일을 반환
    }

    @GetMapping("/boards/{id}")
    public String showBoardDetailPage(@PathVariable Long id) {
        return "board/view"; // view.html 파일을 반환
    }

    @GetMapping("/boards/edit/{id}")
    public String showEditBoardPage(@PathVariable Long id) {
        return "board/edit"; // edit.html 파일을 반환
    }

    @GetMapping("/team_project")
    public String teamProject() {
        return "team_project/team_project";
    }

    @GetMapping("/team_project_list/{folderName}")
    public String getTeamProjectList(@PathVariable String folderName, Model model) {

        model.addAttribute("folderName", folderName);
        return "team_project/team_project_list";
    }

    @GetMapping("/team_loading")
    public String teamLoading() {
        return "team_project/team_loading";
    }

    @GetMapping("/test_team")
    public String testTeam(){
        return "test_team/test_team";
    }

    }



