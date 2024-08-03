package team.devs.devhub.domain.personalproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.personalproject.dto.*;
import team.devs.devhub.domain.personalproject.service.PersonalProjectService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Tag(name = "개인 프로젝트 관련 API", description = "개인 프로젝트 관련 API 입니다")
@Slf4j
public class PersonalProjectController {
    private final PersonalProjectService personalProjectService;

    @PostMapping("/repo/create")
    @Operation(summary = "개인 레포지토리 생성 API", description = "header에 accessToken과 body에 projectName과 description을 담아 요청한다")
    public ResponseEntity<PersonalProjectRepoCreateResponse> createPersonalProjectRepo(
            @RequestBody @Valid PersonalProjectRepoCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectRepoCreateResponse response = personalProjectService.saveProjectRepo(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/repo/read")
    @Operation(summary = "개인 레포지토리 목록 조회 API", description = "header에 accessToken을 담아 요청하면 레포지토리 목록을 리스트 형태로 반환한다")
    public ResponseEntity<List<PersonalProjectRepoReadResponse>> readPersonalProjectRepo(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        List<PersonalProjectRepoReadResponse> responses = personalProjectService.readProjectRepo(customUserDetails.getId());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/project/init")
    @Operation(summary = "개인 프로젝트 최초 저장 API",
            description = "header에 accessToken과 " +
                    "form-data 형식으로 projectId, files(파일 이름에 상대경로가 포함된 프로젝트 파일), commitMessage를 담아 요청한다")
    public ResponseEntity<PersonalProjectInitResponse> initPersonalProject(
            @ModelAttribute PersonalProjectInitRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectInitResponse response = personalProjectService.saveInitialProject(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/project/save")
    @Operation(summary = "개인 프로젝트 다음 버전 저장 API",
            description = "header에 accessToken과 " +
                    "form-data 형식으로 commitId, files(파일 이름에 상대경로가 포함된 프로젝트 파일), commitMessage를 담아 요청한다")
    public ResponseEntity<PersonalProjectSaveResponse> savePersonalProject(
            @ModelAttribute PersonalProjectSaveRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectSaveResponse response = personalProjectService.saveWorkedProject(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/project/meta-read")
    @Operation(summary = "개인 프로젝트 메타데이터 조회 API", description = "header에 accessToken과 parameter에 projectId를 담아 요청을 보낸다")
    public ResponseEntity<PersonalProjectMetaReadResponse> readPersonalProjectMeta(
            @RequestParam("projectId") Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectMetaReadResponse response = personalProjectService.readProjectMetadata(projectId, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/commit-read")
    @Operation(summary = "개인 프로젝트 특정 커밋 조회 API", description = "header에 accessToken과 parameter에 commitId를 담아 요청을 보낸다")
    public ResponseEntity<PersonalProjectCommitReadResponse> readPersonalProjectCommit(
            @RequestParam("commitId") Long commitId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectCommitReadResponse response = personalProjectService.readProjectCommit(commitId, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/text-file")
    @Operation(summary = "개인 프로젝트 텍스트 파일 조회 API", description = "header에 accessToken과 parameter에 commitId와 filePath(경로가 포함된 파일 이름)를 담아 요청을 보낸다")
    public ResponseEntity<String> readTextFile(
            @RequestParam("commitId") Long commitId,
            @RequestParam("filePath") String filePath,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        String response = personalProjectService.readTextFileContent(commitId, filePath, customUserDetails.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + new File(filePath).getName())
                .contentType(MediaType.TEXT_PLAIN)
                .body(response);
    }
}
