package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InviteMailAlreadyExistsException extends BusinessException {

    public InviteMailAlreadyExistsException(ErrorCode errorCode) {
        super(errorCode);
    }
}
