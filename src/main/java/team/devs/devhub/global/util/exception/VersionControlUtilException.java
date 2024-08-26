package team.devs.devhub.global.util.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class VersionControlUtilException extends BusinessException {

    public VersionControlUtilException(ErrorCode errorCode) {
        super(errorCode);
    }
}
