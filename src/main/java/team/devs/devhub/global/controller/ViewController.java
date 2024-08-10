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

    @PostMapping("/send-data")
    public ResponseEntity<String> sendDataToFlask(@RequestBody Map<String, String> data) {
        String flaskUrl = "http://127.0.0.1:5000/";
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(flaskUrl, data, String.class);
        return response;
    }

    @GetMapping("/loading")
    public String loadingPage() {
        return "loading";
    }


    @GetMapping("/project_list")
    public String projectList() {
        return "personal_project/project_list";
    }

    @GetMapping("/personal_project")
    public String personalProject() {
        return "personal_project/personal_project";
    }

    @GetMapping("/team_project")
    public String teamProject() {
        return "team_project/team_project";
    }

    @GetMapping("/team_project_list/{folderName}")
    public String getTeamProjectList(@PathVariable String folderName, Model model) {
        // 폴더 이름에 따라 필요한 데이터를 모델에 추가
        model.addAttribute("folderName", folderName);
        return "team_project/team_project_list";
    }

}