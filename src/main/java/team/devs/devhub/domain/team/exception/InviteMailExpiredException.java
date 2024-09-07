package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InviteMailExpiredException extends BusinessException {

    public InviteMailExpiredException(ErrorCode errorCode) {
        super(errorCode);
    }
}
