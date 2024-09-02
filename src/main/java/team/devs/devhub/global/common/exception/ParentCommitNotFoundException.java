package team.devs.devhub.global.common.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class ParentCommitNotFoundException extends BusinessException {

    public ParentCommitNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
