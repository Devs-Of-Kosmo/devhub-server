package team.devs.devhub.global.util.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class RepositoryUtilException extends BusinessException {

    public RepositoryUtilException(ErrorCode errorCode) {
        super(errorCode);
    }
}
