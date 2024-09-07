package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class InviteEmailMismatchException extends BusinessException {

    public InviteEmailMismatchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
