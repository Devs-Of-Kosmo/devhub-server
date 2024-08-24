package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class ProhibitedBranchNameException extends BusinessException {

    public ProhibitedBranchNameException(ErrorCode errorCode) {
        super(errorCode);
    }
}
