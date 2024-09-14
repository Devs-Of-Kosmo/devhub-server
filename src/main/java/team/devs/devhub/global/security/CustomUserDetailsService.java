package team.devs.devhub.global.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public CustomUserDetails loadUserByUsername(String email) {
        CustomUserDetails customUserDetails = CustomUserDetails.of(
                userRepository.findByEmail(email)
                        .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND))
        );

        return customUserDetails;
    }

}
