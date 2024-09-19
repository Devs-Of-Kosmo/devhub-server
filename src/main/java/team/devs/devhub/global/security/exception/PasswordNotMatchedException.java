package team.devs.devhub.global.security.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class PasswordNotMatchedException extends BusinessException {

    public PasswordNotMatchedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
