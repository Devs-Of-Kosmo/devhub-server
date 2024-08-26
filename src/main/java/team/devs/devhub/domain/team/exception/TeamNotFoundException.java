package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamNotFoundException extends BusinessException {

    public TeamNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
