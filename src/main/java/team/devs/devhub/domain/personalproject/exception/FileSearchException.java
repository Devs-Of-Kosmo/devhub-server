package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class FileSearchException extends BusinessException {

    public FileSearchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
