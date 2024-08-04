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
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }

    @GetMapping("/password-reset")
    public String passwordReset() {
        return "password-reset";
    }

    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }

    @GetMapping("/test")
    public String test() {
        return "test";
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

    @GetMapping("/personal_project")
    public String personalProject() {
        return "personal_project";
    }

    @GetMapping("/project_list")
    public String projectList() {
        return "project_list";
    }
}