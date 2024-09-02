package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InvalidUserCommitException extends BusinessException {

    public InvalidUserCommitException(ErrorCode errorCode) {
        super(errorCode);
    }
}
