package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class DirectoryDeleteException extends BusinessException {

    public DirectoryDeleteException(ErrorCode errorCode) {
        super(errorCode);
    }
}
