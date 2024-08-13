package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class UserTeamNotFoundException extends BusinessException {

    public UserTeamNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
