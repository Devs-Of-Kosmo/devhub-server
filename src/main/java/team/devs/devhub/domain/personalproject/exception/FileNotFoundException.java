package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class FileNotFoundException extends BusinessException {

    public FileNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
