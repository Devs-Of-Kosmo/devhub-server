package team.devs.devhub.domain.user.controller;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.service.OAuth2Service;
import team.devs.devhub.global.jwt.dto.TokenDto;

import java.util.Map;

@Controller
@RequestMapping("/api/oath2")
@RequiredArgsConstructor
public class OAuth2Controller {

    private final OAuth2Service oAuth2Service;

    @GetMapping("/public/google-login")
    public String loginByGoogle(HttpSession session, RedirectAttributes redirectAttributes) {
        User user = (User) session.getAttribute("user");
        session.removeAttribute("user");

        TokenDto tokenDto = oAuth2Service.loginByGoogle(user);
        redirectAttributes.addFlashAttribute("accessToken", tokenDto.getAccessToken());
        redirectAttributes.addFlashAttribute("refreshToken", tokenDto.getRefreshToken());

        return "redirect:/login";
    }

    @GetMapping("/public/register")
    public String registerByGoogleInfo(HttpSession session, RedirectAttributes redirectAttributes) {
        Map<String, Object> oauth2User = (Map<String, Object>) session.getAttribute("oauth2User");
        session.removeAttribute("oauth2User");

        redirectAttributes.addFlashAttribute("email", oauth2User.get("email"));
        redirectAttributes.addFlashAttribute("name", oauth2User.get("name"));

        return "redirect:/register";
    }
}
