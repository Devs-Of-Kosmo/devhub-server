package team.devs.devhub.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.dto.CommonUserResponse;
import team.devs.devhub.domain.user.dto.SignupResponse;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private static final int INITIAL_IDENTIFICATION_CODE = 0;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SignupResponse saveUser(User user) {
        log.info("처리 전" + user);
        /**
         * 예외 처리
         */

        /**
         * 패스워드 인코딩
         */
        user.encodePassword(passwordEncoder);

        /**
         * 식별자 코드 set
         */
        int maxIdentificationCode = userRepository.findMaxIdentificationCodeByName(user.getName())
                .orElse(INITIAL_IDENTIFICATION_CODE);
        user.assignIdentificationCode(maxIdentificationCode);

        log.info("처리 후" + user);
        return SignupResponse.of(userRepository.save(user));
    }

    public CommonUserResponse readUserInfo(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        return CommonUserResponse.of(user);
    }
}
