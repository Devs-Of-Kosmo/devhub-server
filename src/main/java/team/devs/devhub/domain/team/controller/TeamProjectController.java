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
            @Parameter(description = "조회할 팀의 id", example = "1")
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

    @DeleteMapping("/repo/{projectId}")
    @Operation(summary = "팀 레포지토리 삭제 API")
    public ResponseEntity<Void> deleteTeamProjectRepo(
            @Parameter(description = "삭제할 팀 레포지토리의 id", example = "1")
            @PathVariable(name = "projectId") Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        teamProjectService.deleteProjectRepo(projectId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/project/metadata")
    @Operation(summary = "팀 프로젝트 메타데이터 조회 API")
    public ResponseEntity<TeamProjectMetaReadResponse> readTeamProjectMetadata(
            @Parameter(description = "조회할 팀 레포지토리의 id", example = "1")
            @RequestParam("projectId") Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectMetaReadResponse response = teamProjectService.readProjectMetadata(projectId, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/branch")
    @Operation(summary = "팀 프로젝트 작업 브랜치 조회 API")
    public ResponseEntity<List<TeamProjectBranchReadResponse>> readTeamProjectBranch(
            @Parameter(description = "조회할 브랜치가 파생된 커밋 id", example = "1")
            @RequestParam("commitId") Long commitId
    ) {
        List<TeamProjectBranchReadResponse> responses = teamProjectService.readBranches(commitId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/project/branch/commit")
    @Operation(summary = "팀 프로젝트 작업 브랜치 커밋 이력 조회 API")
    public ResponseEntity<List<TeamProjectBranchCommitsReadResponse>> readBranchCommitHistory(
            @Parameter(description = "조회할 커밋의 브랜치 id", example = "1")
            @RequestParam("branchId") Long branchId
    ) {
        List<TeamProjectBranchCommitsReadResponse> responses = teamProjectService.readWorkingBranchCommitHistory(branchId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/project/init")
    @Operation(summary = "팀 프로젝트 최초 저장 API")
    public ResponseEntity<TeamProjectInitResponse> initTeamProject(
            @Parameter(description = "projectId : 저장하는 프로젝트의 id, files : 경로가 포함된 파일 데이터, commitMessage : 남길 메시지")
            @ModelAttribute TeamProjectInitRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectInitResponse response = teamProjectService.saveInitialProject(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/project/branch")
    @Operation(summary = "팀 프로젝트 브랜치 생성 API")
    public ResponseEntity<TeamProjectBranchCreateResponse> createTeamProjectBranch(
            @RequestBody @Valid TeamProjectBranchCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectBranchCreateResponse response = teamProjectService.saveBranch(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/project/branch/{branchId}")
    @Operation(summary = "팀 프로젝트 브랜치 삭제 API")
    public ResponseEntity<Void> deleteTeamProjectBranch(
            @Parameter(description = "삭제할 브랜치 id", example = "1")
            @PathVariable(name = "branchId") Long branchId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        teamProjectService.deleteBranch(branchId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/project/save")
    @Operation(summary = "팀 프로젝트 다음 커밋 저장 API")
    public ResponseEntity<TeamProjectSaveResponse> saveTeamProject(
            @Parameter(description = "branchId : 커밋하는 브랜치의 id, fromCommitId : 저장하려는 커밋의 부모 커밋 id,  files : 파일 데이터(이름에 상대 경로 포함), " +
                    "deleteFileNames : (노션 참고), renameFileNames : (노션참고), commitMessage : 남길 메시지")
            @ModelAttribute TeamProjectSaveRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectSaveResponse response = teamProjectService.saveWorkedProject(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/project/commit/{commitId}")
    @Operation(summary = "팀 프로젝트 커밋 이력 삭제 API")
    public ResponseEntity<Void> deleteCommitHistory(
            @Parameter(description = "삭제할 커밋 id", example = "1")
            @PathVariable(name = "commitId") Long commitId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        teamProjectService.deleteCommitHistory(commitId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

}
