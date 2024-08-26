package team.devs.devhub.domain.message.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InvalidWebSocketSessionException extends BusinessException {
    public InvalidWebSocketSessionException(ErrorCode errorCode) {
        super(errorCode);
    }
}
