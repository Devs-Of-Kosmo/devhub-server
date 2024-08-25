package team.devs.devhub.domain.personal.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class RepositoryLimitExceededException extends BusinessException {

    public RepositoryLimitExceededException(ErrorCode errorCode) {
        super(errorCode);
    }
}
