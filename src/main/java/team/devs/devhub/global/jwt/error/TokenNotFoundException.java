package team.devs.devhub.global.jwt.error;


import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class TokenNotFoundException extends BusinessException {
    public TokenNotFoundException(String message, ErrorCode errorCode) {
        super(message, errorCode);
    }
}
