package team.devs.devhub.global.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Controller
public class ViewController {

    @GetMapping("/main")
    public String welcome() {
        return "main";
    }

    @GetMapping("/login")
    public String login() {
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
    @PostMapping("/send-data")
    public ResponseEntity<String> sendDataToFlask(@RequestBody Map<String, String> data) {
        String flaskUrl = "http://127.0.0.1:5000/";
        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(flaskUrl, data, String.class);
        return response;
    }
}
