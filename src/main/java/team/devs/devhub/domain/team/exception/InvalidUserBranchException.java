package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InvalidUserBranchException extends BusinessException {

    public InvalidUserBranchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
