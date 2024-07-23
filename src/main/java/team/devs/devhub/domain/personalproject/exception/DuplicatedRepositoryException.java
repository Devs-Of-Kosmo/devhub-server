package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class DuplicatedRepositoryException extends BusinessException {
    public DuplicatedRepositoryException(ErrorCode errorCode) {
        super(errorCode);
    }
}
