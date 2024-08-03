package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class CommitResetException extends BusinessException {

    public CommitResetException(ErrorCode errorCode) {
        super(errorCode);
    }
}
