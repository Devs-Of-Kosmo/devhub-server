package team.devs.devhub.domain.user.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.jwt.TokenProvider;
import team.devs.devhub.global.jwt.dto.TokenDto;

@Service
@RequiredArgsConstructor
public class OAuth2Service {

    private final AuthenticationManager authenticationManager;
    private final TokenProvider tokenProvider;

    public TokenDto loginByGoogle(User user) {
        UsernamePasswordAuthenticationToken authenticationToken =
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword());

        Authentication authentication = authenticationManager.authenticate(authenticationToken);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String atk = tokenProvider.provideAccessToken(authentication);
        String rtk = tokenProvider.provideRefreshToken(authentication);

        return TokenDto.of(atk, rtk);
    }

}
