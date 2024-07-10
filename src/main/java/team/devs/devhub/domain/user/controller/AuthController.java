package team.devs.devhub.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
@Tag(name = "인증 관련 API", description = "인증 관련 API 입니다")
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
    @Operation(summary = "로그인 API", description = "email, password를 보내고 accessToken을 받는다")
    public ResponseEntity<LoginResponse> login(
            @RequestBody @Valid LoginRequest request
    ) {
        TokenDto tokenDto = authService.login(request);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, getCookie(tokenDto.getRefreshToken()).toString())
                .body(LoginResponse.of(tokenDto.getAccessToken()));
    }

    @PostMapping("/public/reissue")
    @Operation(summary = "accessToken 재발급 API", description = "accessToken 유효기간이 만료됐을 때 재 요청한다, " +
                                                "유효기간이 만료된 accessToken을 보내고 재발급한 accessToken을 받는다")
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
