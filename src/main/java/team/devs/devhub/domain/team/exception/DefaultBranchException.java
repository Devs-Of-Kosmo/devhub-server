package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class DefaultBranchException extends BusinessException {

    public DefaultBranchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
