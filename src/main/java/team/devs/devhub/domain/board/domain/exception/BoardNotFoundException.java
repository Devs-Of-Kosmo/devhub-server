package team.devs.devhub.domain.board.domain.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class BoardNotFoundException extends BusinessException {
    public BoardNotFoundException(ErrorCode errorCode) {super(errorCode);}
}
