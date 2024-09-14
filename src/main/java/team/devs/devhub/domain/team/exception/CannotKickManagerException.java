package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class CannotKickManagerException extends BusinessException {

    public CannotKickManagerException(ErrorCode errorCode) {
        super(errorCode);
    }
}
