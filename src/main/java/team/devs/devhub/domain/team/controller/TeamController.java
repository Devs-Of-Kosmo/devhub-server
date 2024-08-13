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
import team.devs.devhub.domain.team.dto.*;
import team.devs.devhub.domain.team.service.TeamService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

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

    @GetMapping("/group/list")
    @Operation(summary = "팀 목록 조회 API")
    public ResponseEntity<List<TeamGroupReadResponse>> readTeamGroups(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        List<TeamGroupReadResponse> response = teamService.readTeamGroups(customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/group/{teamId}")
    @Operation(summary = "팀 상세 조회 API")
    public ResponseEntity<TeamDetailsReadResponse> readTeamDetails(
            @Parameter(description = "조회할 팀 id", example = "1")
            @PathVariable(name = "teamId") Long teamId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamDetailsReadResponse response = teamService.readTeamDetails(teamId, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/group")
    @Operation(summary = "팀 정보 수정 API")
    public ResponseEntity<TeamGroupUpdateResponse> updateTeamInfo(
            @RequestBody @Valid TeamGroupUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamGroupUpdateResponse response = teamService.updateTeamInfo(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/group/{teamId}")
    @Operation(summary = "팀 삭제 API")
    public ResponseEntity<Void> deleteTeamGroup(
            @Parameter(description = "삭제할 팀 id", example = "1")
            @PathVariable(name = "teamId") Long teamId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        teamService.deleteTeam(teamId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/group/{teamId}")
    @Operation(summary = "팀 삭제 취소 API")
    public ResponseEntity<Void> cancelDeletedTeamGroup(
            @Parameter(description = "삭제 취소할 팀 id", example = "1")
            @PathVariable(name = "teamId") Long teamId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        teamService.updateDeleteCancelTeam(teamId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
