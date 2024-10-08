package team.devs.devhub.domain.personal.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class PersonalProjectNotFoundException extends BusinessException {

    public PersonalProjectNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }
}
