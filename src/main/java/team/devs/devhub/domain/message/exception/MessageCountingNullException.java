package team.devs.devhub.domain.message.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class MessageCountingNullException extends BusinessException {
    public MessageCountingNullException(ErrorCode errorCode) {
        super(errorCode);
    }
}
