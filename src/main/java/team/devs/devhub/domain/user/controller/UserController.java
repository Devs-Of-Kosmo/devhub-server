package team.devs.devhub.domain.user.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import team.devs.devhub.domain.user.dto.SignupRequest;
import team.devs.devhub.domain.user.dto.SignupResponse;
import team.devs.devhub.domain.user.service.UserService;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping("/public/signup")
    public ResponseEntity<SignupResponse> signup(
            @RequestBody @Valid SignupRequest request
    ) {

        SignupResponse response = userService.saveUser(request.toEntity());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


}
