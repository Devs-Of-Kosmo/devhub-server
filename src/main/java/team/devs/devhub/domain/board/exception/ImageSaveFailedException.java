package team.devs.devhub.domain.board.exception;

import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;

public class ImageSaveFailedException extends BusinessException {
    public ImageSaveFailedException(ErrorCode errorCode) {super(errorCode);}
}

