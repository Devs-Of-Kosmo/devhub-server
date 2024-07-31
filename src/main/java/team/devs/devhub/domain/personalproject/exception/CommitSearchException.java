package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class CommitSearchException extends BusinessException {

    public CommitSearchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
