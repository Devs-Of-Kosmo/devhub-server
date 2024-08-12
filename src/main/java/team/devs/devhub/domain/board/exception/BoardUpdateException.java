package team.devs.devhub.domain.board.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class BoardUpdateException extends BusinessException {
    public BoardUpdateException(ErrorCode errorCode){super(errorCode);}
}
