package team.devs.devhub.global.util.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class BranchNotFoundException extends BusinessException {

    public BranchNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
