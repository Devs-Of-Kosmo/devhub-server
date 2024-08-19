package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamNameDuplicatedException extends BusinessException {

    public TeamNameDuplicatedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
