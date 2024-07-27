package team.devs.devhub.domain.user.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class AuthenticationCodeException extends BusinessException {
    public AuthenticationCodeException(ErrorCode errorCode) {
        super(errorCode);
    }
}
