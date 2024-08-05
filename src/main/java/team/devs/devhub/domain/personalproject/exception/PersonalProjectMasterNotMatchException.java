package team.devs.devhub.domain.personalproject.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class PersonalProjectMasterNotMatchException extends BusinessException {

    public PersonalProjectMasterNotMatchException(ErrorCode errorCode) {
        super(errorCode);
    }
}
