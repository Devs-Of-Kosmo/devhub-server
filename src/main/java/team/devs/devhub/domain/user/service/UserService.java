package team.devs.devhub.domain.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.dto.UserInfoResponse;
import team.devs.devhub.domain.user.dto.SignupResponse;
import team.devs.devhub.domain.user.exception.EmailDuplicatedException;
import team.devs.devhub.domain.user.exception.PasswordPatternException;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.policy.RegisterPolicy;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final int INITIAL_IDENTIFICATION_CODE = 0;
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(RegisterPolicy.PASSWORD_PATTERN);

    public SignupResponse saveUser(User user) {
        verifyDuplicatedEmail(user.getEmail());
        verifyPasswordPattern(user.getPassword());

        user.encodePassword(passwordEncoder);

        int maxIdentificationCode = userRepository.findMaxIdentificationCodeByName(user.getName())
                .orElse(INITIAL_IDENTIFICATION_CODE);
        user.assignIdentificationCode(maxIdentificationCode);

        return SignupResponse.of(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserInfoResponse readUserInfo(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        return UserInfoResponse.of(user);
    }

    private void verifyDuplicatedEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new EmailDuplicatedException(ErrorCode.EMAIL_DUPLICATED);
        }
    }

    private void verifyPasswordPattern(String password) {
        Matcher matcher = PASSWORD_PATTERN.matcher(password);
        if (!matcher.find()) {
            throw new PasswordPatternException(ErrorCode.INCORRECT_PASSWORD_PATTERN);
        }
    }
}
