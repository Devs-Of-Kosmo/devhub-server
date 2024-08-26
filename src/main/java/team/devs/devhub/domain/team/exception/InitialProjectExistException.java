package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InitialProjectExistException extends BusinessException {

    public InitialProjectExistException(ErrorCode errorCode) {
        super(errorCode);
    }
}
