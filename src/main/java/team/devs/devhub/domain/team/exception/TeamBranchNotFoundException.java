package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamBranchNotFoundException extends BusinessException {

    public TeamBranchNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
