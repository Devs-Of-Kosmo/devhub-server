package team.devs.devhub.domain.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.devs.devhub.domain.user.dto.EmailAuthenticationRequest;
import team.devs.devhub.domain.user.dto.EmailAuthenticationResponse;
import team.devs.devhub.domain.user.dto.MailSendRequest;
import team.devs.devhub.domain.user.dto.MailSendResponse;
import team.devs.devhub.domain.user.service.MailService;

@RestController
@RequestMapping("/api/mail")
@RequiredArgsConstructor
@Tag(name = "이메일 인증 관련 API", description = "이메일 인증 관련 API 입니다")
public class MailController {

    private final MailService emailService;

    @PostMapping("/public/send")
    @Operation(summary = "이메일 인증코드 요청 API", description = "인증할 email을 보내고 toEmail을 받는다")
    public ResponseEntity<MailSendResponse> send(
            @RequestBody @Valid MailSendRequest request
    ) {
        return ResponseEntity.ok(emailService.sendEmail(request.getEmail()));
    }

    @PostMapping("/public/check")
    @Operation(summary = "인증코드 검증 API", description = "인증할 email과 검증코드 authenticationCode를 보내고 검증여부 verified를 받는다")
    public ResponseEntity<EmailAuthenticationResponse> check(
            @RequestBody @Valid EmailAuthenticationRequest request
    ) {
        return ResponseEntity.ok(emailService.checkEmailCode(request.getEmail(), request.getAuthenticationCode()));
    }
}
