package team.devs.devhub.global.common.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class FileSizeOverException extends BusinessException {

    public FileSizeOverException(ErrorCode errorCode) {
        super(errorCode);
    }
}
