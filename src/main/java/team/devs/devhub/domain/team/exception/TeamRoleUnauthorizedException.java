package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamRoleUnauthorizedException extends BusinessException {

    public TeamRoleUnauthorizedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
