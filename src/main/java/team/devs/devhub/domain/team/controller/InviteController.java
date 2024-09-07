package team.devs.devhub.domain.team.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import team.devs.devhub.domain.team.dto.invite.TeamInviteRequest;
import team.devs.devhub.domain.team.dto.invite.TeamInviteResponse;
import team.devs.devhub.domain.team.dto.invite.TeamJoinRequest;
import team.devs.devhub.domain.team.dto.invite.TeamJoinResponse;
import team.devs.devhub.domain.team.service.InviteService;
import team.devs.devhub.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/invite")
@RequiredArgsConstructor
@Tag(name = "팀 초대 관련 API", description = "팀 초대 관련 API 입니다")
public class InviteController {
    private final InviteService inviteService;

    @PostMapping
    @Operation(summary = "팀 초대 메일 송신 API")
    public ResponseEntity<TeamInviteResponse> inviteToTeam(
            @RequestBody @Valid TeamInviteRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamInviteResponse response = inviteService.sendInviteMail(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join")
    @Operation(summary = "초대 된 팀 가입 API")
    public ResponseEntity<TeamJoinResponse> joinToTeam(
            @RequestBody @Valid TeamJoinRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamJoinResponse response = inviteService.saveUserToTeam(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
