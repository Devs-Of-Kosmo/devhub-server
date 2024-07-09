package team.devs.devhub.domain.user.controller;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.user.dto.auth.LoginRequest;
import team.devs.devhub.domain.user.dto.auth.LoginResponse;
import team.devs.devhub.domain.user.dto.auth.ReissueRequest;
import team.devs.devhub.domain.user.service.AuthService;
import team.devs.devhub.global.jwt.dto.TokenDto;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {
    private final AuthService authService;
    private Long refreshTokenValidityInMillisecond;

    public AuthController(
            AuthService authService,
            @Value("${jwt.refreshToken-validity-in-seconds}") long refreshTokenValidityInMillisecond
    ) {
        this.authService = authService;
        this.refreshTokenValidityInMillisecond = refreshTokenValidityInMillisecond;
    }

    @PostMapping("/public/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody @Valid LoginRequest request
    ) {
        TokenDto tokenDto = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, getCookie(tokenDto.getRefreshToken()).toString())
                .body(LoginResponse.of(tokenDto.getAccessToken()));
    }

    @PostMapping("/public/reissue")
    public ResponseEntity<LoginResponse> reissue(
            @RequestBody ReissueRequest request,
            @CookieValue(name = "refreshToken") String refreshToken
    ) {
        return ResponseEntity.ok(authService.reissue(request.getAccessToken(), refreshToken));
    }

    private ResponseCookie getCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(refreshTokenValidityInMillisecond)
                .build();
    }
}
