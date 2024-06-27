package team.devs.devhub.global.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping()
    public String welcome() {
        return "main";
    }
}
