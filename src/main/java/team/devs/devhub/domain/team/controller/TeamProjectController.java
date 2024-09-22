package team.devs.devhub.domain.team.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.team.dto.project.*;
import team.devs.devhub.domain.team.service.TeamProjectService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

@RestController
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

    @GetMapping("/project/commit")
    @Operation(summary = "팀 프로젝트 특정 커밋 조회 API")
    public ResponseEntity<TeamProjectCommitReadResponse> readTeamProjectCommit(
            @Parameter(description = "조회할 커밋 id", example = "1")
            @RequestParam("commitId") Long commitId
    ) {
        TeamProjectCommitReadResponse response = teamProjectService.readProjectCommit(commitId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/text-file")
    @Operation(summary = "팀 프로젝트 텍스트 파일 조회 API")
    public ResponseEntity<String> readTextFile(
            @Parameter(description = "조회할 텍스트 파일의 커밋 id", example = "1")
            @RequestParam("commitId") Long commitId,
            @Parameter(description = "조회할 텍스트 파일의 (경로가 포함된) 이름", example = "path/text1.txt")
            @RequestParam("filePath") String filePath
    ) {
        String response = teamProjectService.readTextFileContent(commitId, filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + new File(filePath).getName())
                .contentType(MediaType.TEXT_PLAIN)
                .body(response);
    }

    @GetMapping("/project/image-file")
    @Operation(summary = "팀 프로젝트 이미지 파일 조회 API")
    public ResponseEntity<InputStreamResource> readImageFile(
            @Parameter(description = "조회할 이미지 파일의 커밋 id", example = "1")
            @RequestParam("commitId") Long commitId,
            @Parameter(description = "조회할 이미지 파일의 (경로가 포함된) 이름", example = "path/image1.jpg")
            @RequestParam("filePath") String filePath
    ) {
        InputStreamResource response = teamProjectService.readImageFileContent(commitId, filePath);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + new File(filePath).getName())
                .contentType(getMediaTypeForImage(filePath))
                .body(response);
    }

    @GetMapping("/project/download")
    @Operation(summary = "팀 프로젝트 다운로드 API", description = "다운로드 시 파일 이름을 응답 헤더에 'Content-Disposition'의 filename 값을 파싱하여 설정한다")
    public ResponseEntity<ByteArrayResource> downloadFile(
            @Parameter(description = "다운로드 할 시점의 커밋 id", example = "1")
            @RequestParam("commitId") Long commitId
    ) {
        TeamProjectDownloadDto response = teamProjectService.provideProjectFilesAsZip(commitId);
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + getEncodedProjectName(response.getProjectName()) + ".zip\";"
                )
                .contentLength(response.getResource().contentLength())
                .body(response.getResource());
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

    @PostMapping("/project/branch/merge/request")
    @Operation(summary = "팀 프로젝트 브랜치 병합 요청 API")
    public ResponseEntity<TeamProjectBranchMergeSuggestResponse> suggestBranchMerge(
            @RequestBody @Valid TeamProjectBranchMergeSuggestRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectBranchMergeSuggestResponse response = teamProjectService.updateMergeConditionToRequested(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/branch/merge")
    @Operation(summary = "팀 프로젝트 브랜치 병합 요청 목록 조회 API")
    public ResponseEntity<List<TeamProjectSuggestedBranchMergeResponse>> readSuggestedBranchMerge(
            @Parameter(description = "조회할 병합 요청 목록의 프로젝트 id", example = "1")
            @RequestParam("projectId") Long projectId
    ) {
        List<TeamProjectSuggestedBranchMergeResponse> responses = teamProjectService.readSuggestedBranchMerge(projectId);
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/project/branch/merge")
    @Operation(summary = "팀 프로젝트 브랜치 병합 요청 수락 API")
    public ResponseEntity<TeamProjectBranchMergeResponse> acceptBranchMergeSuggestion(
            @RequestBody @Valid TeamProjectBranchMergeRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectBranchMergeResponse response = teamProjectService.mergeBranch(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/project/branch/merge/request-cancel")
    @Operation(summary = "팀 프로젝트 브랜치 병합 요청 취소 API")
    public ResponseEntity<TeamProjectBranchMergeSuggestResponse> cancelBranchMergeSuggestion(
            @RequestBody @Valid TeamProjectBranchMergeSuggestRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        TeamProjectBranchMergeSuggestResponse response = teamProjectService.updateMergeConditionToBeforeRequest(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    private MediaType getMediaTypeForImage(String filePath) {
        String fileExtension = getFileExtension(filePath).toLowerCase();

        switch (fileExtension) {
            case "jpg":
            case "jpeg":
                return MediaType.IMAGE_JPEG;
            case "png":
                return MediaType.IMAGE_PNG;
            case "gif":
                return MediaType.IMAGE_GIF;
            case "bmp":
                return MediaType.valueOf("image/bmp");
            default:
                return MediaType.APPLICATION_OCTET_STREAM;
        }
    }

    private String getFileExtension(String filePath) {
        int lastIndexOfDot = filePath.lastIndexOf('.');
        if (lastIndexOfDot == -1) {
            return "";
        }
        return filePath.substring(lastIndexOfDot + 1);
    }

    private String getEncodedProjectName(String projectName) {
        try {
            return URLEncoder.encode(projectName, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        return "project";
    }

}
