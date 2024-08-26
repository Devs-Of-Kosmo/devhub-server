package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TeamBranchDuplicatedException extends BusinessException {

    public TeamBranchDuplicatedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
