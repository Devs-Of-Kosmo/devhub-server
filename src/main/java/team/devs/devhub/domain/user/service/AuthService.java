package team.devs.devhub.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.user.dto.auth.LoginRequest;
import team.devs.devhub.domain.user.dto.auth.LoginResponse;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.jwt.TokenProvider;
import team.devs.devhub.global.jwt.dto.TokenDto;
import team.devs.devhub.global.jwt.error.TokenNotFoundException;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    public TokenDto login(LoginRequest request) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String atk = tokenProvider.provideAccessToken(authentication);
        String rtk = tokenProvider.provideRefreshToken(authentication);

        return TokenDto.of(atk, rtk);
    }

    public LoginResponse reissue(String accessToken, String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new TokenNotFoundException("잘못된 JWT 서명입니다.", ErrorCode.HANDLE_ACCESS_DENIED);
        }

        Authentication authentication = tokenProvider.getAuthentication(accessToken);
        return LoginResponse.of(tokenProvider.provideAccessToken(authentication));
    }

}
