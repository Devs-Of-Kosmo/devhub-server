package team.devs.devhub.domain.team.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.team.dto.project.TeamProjectRepoCreateRequest;
import team.devs.devhub.domain.team.dto.project.TeamProjectRepoCreateResponse;
import team.devs.devhub.domain.team.service.TeamProjectService;
import team.devs.devhub.global.security.CustomUserDetails;

@RestController
@CrossOrigin(origins = "http://127.0.0.1:5000")
@RequestMapping("/api/team")
@RequiredArgsConstructor
@Tag(name = "팀 프로젝트 관련 API", description = "팀 프로젝트 관련 API 입니다")
public class TeamProjectController {

    private final TeamProjectService teamProjectService;

    @PostMapping("/repo")
    @Operation(summary = "팀 레포지토리 생성 API")
    public ResponseEntity<TeamProjectRepoCreateResponse> createTeamProjectRepo(
            @RequestBody @Valid TeamProjectRepoCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectRepoCreateResponse response = teamProjectService.saveProjectRepo(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
