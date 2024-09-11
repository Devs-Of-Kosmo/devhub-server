package team.devs.devhub.domain.team.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class CancelSuggestionAuthorizationException extends BusinessException {

    public CancelSuggestionAuthorizationException(ErrorCode errorCode) {
        super(errorCode);
    }
}
