package team.devs.devhub.domain.team.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.team.dto.TeamGroupCreateRequest;
import team.devs.devhub.domain.team.dto.TeamGroupCreateResponse;
import team.devs.devhub.domain.team.service.TeamService;
import team.devs.devhub.global.security.CustomUserDetails;

@RestController
@RequestMapping("/api/team")
@CrossOrigin(origins = "http://127.0.0.1:5000")
@RequiredArgsConstructor
@Tag(name = "팀 관련 API", description = "팀 관련 API 입니다")
public class TeamController {

    private final TeamService teamService;

    @PostMapping("/group")
    @Operation(summary = "팀 생성 API")
    public ResponseEntity<TeamGroupCreateResponse> createTeamGroup(
            @RequestBody @Valid TeamGroupCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamGroupCreateResponse response = teamService.saveTeamGroup(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
