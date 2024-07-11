package team.devs.devhub.domain.user.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class PasswordPatternException extends BusinessException {
    public PasswordPatternException(ErrorCode errorCode) {
        super(errorCode);
    }
}
