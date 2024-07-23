package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class RepositoryCreationException extends BusinessException {

    public RepositoryCreationException(ErrorCode errorCode) {
        super(errorCode);
    }
}
