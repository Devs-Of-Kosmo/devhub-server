package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InvalidMergeConditionException extends BusinessException {

    public InvalidMergeConditionException(ErrorCode errorCode) {
        super(errorCode);
    }
}
