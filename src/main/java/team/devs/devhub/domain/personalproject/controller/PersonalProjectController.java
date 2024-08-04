package team.devs.devhub.domain.personalproject.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
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
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Tag(name = "개인 프로젝트 관련 API", description = "개인 프로젝트 관련 API 입니다")
@Slf4j
public class PersonalProjectController {
    private final PersonalProjectService personalProjectService;

    @PostMapping("/repo")
    @Operation(summary = "개인 레포지토리 생성 API", description = "header에 accessToken과 body에 projectName과 description을 담아 요청한다")
    public ResponseEntity<PersonalProjectRepoCreateResponse> createPersonalProjectRepo(
            @RequestBody @Valid PersonalProjectRepoCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectRepoCreateResponse response = personalProjectService.saveProjectRepo(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/repo/list")
    @Operation(summary = "개인 레포지토리 목록 조회 API", description = "header에 accessToken을 담아 요청하면 레포지토리 목록을 리스트 형태로 반환한다")
    public ResponseEntity<List<PersonalProjectRepoReadResponse>> readPersonalProjectRepo(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        List<PersonalProjectRepoReadResponse> responses = personalProjectService.readProjectRepo(customUserDetails.getId());
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/repo")
    @Operation(summary = "개인 레포지토리 수정 API", description = "header에 accessToken과 body에 변경할 projectId, changedProjectName과 changedDescription을 담아 요청한다")
    public ResponseEntity<PersonalProjectRepoUpdateResponse> updatePersonalProjectRepo(
            @RequestBody @Valid PersonalProjectRepoUpdateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectRepoUpdateResponse response = personalProjectService.updateProjectRepo(request, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/repo/{projectId}")
    public ResponseEntity<Void> deletePersonalProjectRepo(
            @PathVariable(name = "projectId") Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        personalProjectService.deleteProjectRepo(projectId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
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

    @GetMapping("/project/metadata")
    @Operation(summary = "개인 프로젝트 메타데이터 조회 API", description = "header에 accessToken과 parameter에 projectId를 담아 요청을 보낸다")
    public ResponseEntity<PersonalProjectMetaReadResponse> readPersonalProjectMeta(
            @RequestParam("projectId") Long projectId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectMetaReadResponse response = personalProjectService.readProjectMetadata(projectId, customUserDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/project/commit")
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

    @GetMapping("/project/image-file")
    @Operation(summary = "개인 프로젝트 이미지 파일 조회 API", description = "header에 accessToken과 parameter에 commitId와 filePath(경로가 포함된 파일 이름)를 담아 요청을 보낸다")
    public ResponseEntity<InputStreamResource> readImageFile(
            @RequestParam("commitId") Long commitId,
            @RequestParam("filePath") String filePath,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        InputStreamResource response = personalProjectService.readImageFileContent(commitId, filePath, customUserDetails.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + new File(filePath).getName())
                .contentType(getMediaTypeForImage(filePath))
                .body(response);
    }

    @DeleteMapping("/project/commit/{commitId}")
    @Operation(summary = "개인 프로젝트 커밋 이력 삭제 API", description = "header에 accessToken과 경로 {commitId}에 삭제할 commitId를 담아 요청을 보낸다")
    public ResponseEntity<Void> deleteCommitHistory(
            @PathVariable(name = "commitId") Long commitId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        personalProjectService.deleteCommitHistory(commitId, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/project/download")
    @Operation(summary = "개인 프로젝트 다운로드 API", description = "header에 accessToken과 parmeter에 다운로드 받을 프로젝트 특정 시점의 commitId를 담아 요청을 보낸다 "
                                                            + "(다운로드 시 파일 이름은 응답 헤더에 'Content-Disposition'의 filename 값으로 설정)")
    public ResponseEntity<ByteArrayResource> downloadFile(
            @RequestParam("commitId") Long commitId,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectDownloadDto response = personalProjectService.provideProjectFilesAsZip(commitId, customUserDetails.getId());
        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + getEncodedProjectName(response.getProjectName()) + ".zip\";"
                )
                .contentLength(response.getResource().contentLength())
                .body(response.getResource());
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
