package team.devs.devhub.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.user.dto.UserInfoResponse;
import team.devs.devhub.domain.user.dto.SignupRequest;
import team.devs.devhub.domain.user.dto.SignupResponse;
import team.devs.devhub.domain.user.service.UserService;
import team.devs.devhub.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://127.0.0.1:5000")
@RequiredArgsConstructor
@Tag(name = "유저 관련 API", description = "유저 관련 API 입니다")
public class UserController {
    private final UserService userService;

    @PostMapping("/public/signup")
    @Operation(summary = "회원가입 API", description = "email, password, name을 보내고 DB에 저장 된 유저의 식별자 id를 받는다")
    public ResponseEntity<SignupResponse> signup(
            @RequestBody @Valid SignupRequest request
    ) {
        SignupResponse response = userService.saveUser(request.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/info")
    @Operation(summary = "내 정보 조회 API", description = "요청하는 유저의 정보를 받는다, JWT 토큰을 Header Authorization에 \"Bearer {accessToken}\" 형식으로 보낸다")
    public ResponseEntity<UserInfoResponse> readMyInfo(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        return ResponseEntity.ok(userService.readUserInfo(customUserDetails.getId()));
    }


}
