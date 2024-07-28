package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class PersonalCommitNotFoundException extends BusinessException {

    public PersonalCommitNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
