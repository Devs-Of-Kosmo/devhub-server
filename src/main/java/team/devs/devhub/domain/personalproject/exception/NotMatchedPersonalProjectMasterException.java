package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class NotMatchedPersonalProjectMasterException extends BusinessException {

    public NotMatchedPersonalProjectMasterException(ErrorCode errorCode) {
        super(errorCode);
    }
}
