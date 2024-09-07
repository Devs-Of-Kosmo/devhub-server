package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class UserAlreadyInTeamException extends BusinessException {

    public UserAlreadyInTeamException(ErrorCode errorCode) {
        super(errorCode);
    }
}
