package team.devs.devhub.domain.user.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class EmailDuplicatedException extends BusinessException {

    public EmailDuplicatedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
