package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamCommitNotFoundException extends BusinessException {

    public TeamCommitNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
