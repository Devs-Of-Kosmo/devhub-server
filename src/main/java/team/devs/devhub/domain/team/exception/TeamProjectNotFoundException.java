package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamProjectNotFoundException extends BusinessException {

    public TeamProjectNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
