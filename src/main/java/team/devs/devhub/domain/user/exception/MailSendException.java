package team.devs.devhub.domain.user.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class MailSendException extends BusinessException {

    public MailSendException(ErrorCode errorCode) {
        super(errorCode);
    }
}
