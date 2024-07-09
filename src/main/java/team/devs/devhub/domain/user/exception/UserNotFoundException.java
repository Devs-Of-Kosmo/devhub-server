package team.devs.devhub.domain.user.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class UserNotFoundException extends BusinessException {

    public UserNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
