package team.devs.devhub.domain.personalproject.controller;

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
import team.devs.devhub.domain.personalproject.dto.PersonalProjectCreateRequest;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectCreateResponse;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectReadResponse;
import team.devs.devhub.domain.personalproject.service.PersonalProjectService;
import team.devs.devhub.global.security.CustomUserDetails;

import java.util.List;

@RestController
@RequestMapping("/api/personal")
@RequiredArgsConstructor
@Tag(name = "개인 프로젝트 관련 API", description = "개인 프로젝트 관련 API 입니다")
public class PersonalProjectController {
    private final PersonalProjectService personalProjectService;

    @PostMapping("/create")
    @Operation(summary = "개인 프로젝트 생성 API", description = "header에 accessToken과 body에 projectName과 description을 담아 요청한다")
    public ResponseEntity<PersonalProjectCreateResponse> createProject(
            @RequestBody @Valid PersonalProjectCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        PersonalProjectCreateResponse response = personalProjectService.savePersonalProject(request, customUserDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/read")
    @Operation(summary = "개인 프로젝트 목록 조회 API", description = "header에 accessToken을 담아 요청하면 레포지토리 목록을 리스트 형태로 반환한다")
    public ResponseEntity<List<PersonalProjectReadResponse>> readProjects(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        List<PersonalProjectReadResponse> responses = personalProjectService.readPersonalProject(customUserDetails.getId());
        return ResponseEntity.ok(responses);
    }
}
