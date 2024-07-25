package team.devs.devhub.domain.message.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class MessageNotFoundException extends BusinessException {

    public MessageNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
