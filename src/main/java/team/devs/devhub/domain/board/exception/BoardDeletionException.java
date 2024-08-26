package team.devs.devhub.domain.board.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class BoardDeletionException extends BusinessException {
    public BoardDeletionException(ErrorCode errorCode){super(errorCode);}
}
