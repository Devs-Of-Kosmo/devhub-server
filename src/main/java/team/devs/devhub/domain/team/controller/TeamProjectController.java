package team.devs.devhub.domain.team.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.team.dto.project.*;
import team.devs.devhub.domain.team.service.TeamProjectService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

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

    @GetMapping("/repo/list/{teamId}")
    @Operation(summary = "팀 레포지토리 목록 조회 API")
    public ResponseEntity<List<TeamProjectRepoReadResponse>> readTeamProjectRepo(
            @Parameter(description = "조회할 팀 id", example = "1")
            @PathVariable(name = "teamId") Long teamId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        List<TeamProjectRepoReadResponse> responses = teamProjectService.readProjectRepo(teamId, customUserDetails.getId());
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/repo")
    @Operation(summary = "팀 레포지토리 수정 API")
    public ResponseEntity<TeamProjectRepoUpdateResponse> updateTeamProjectRepo(
            @RequestBody @Valid TeamProjectRepoUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectRepoUpdateResponse response = teamProjectService.updateProjectRepo(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }
}
