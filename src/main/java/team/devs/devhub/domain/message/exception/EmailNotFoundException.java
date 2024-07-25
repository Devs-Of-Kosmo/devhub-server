package team.devs.devhub.domain.message.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class EmailNotFoundException extends BusinessException {
    public EmailNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
