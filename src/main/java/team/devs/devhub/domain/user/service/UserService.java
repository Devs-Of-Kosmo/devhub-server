package team.devs.devhub.domain.user.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.dto.SignupResponse;

@Service
@Transactional
@Slf4j
public class UserService {

    public SignupResponse saveUser(User user) {
        log.info(user.toString());
        return null;
    }
}
