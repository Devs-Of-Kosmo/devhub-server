package team.devs.devhub.global.error.exception;

public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "C001", " Invalid Input Value"),
    METHOD_NOT_ALLOWED(405, "C002", " Invalid Input Value"),
    INTERNAL_SERVER_ERROR(500, "C004", "Server Error"),
    INVALID_TYPE_VALUE(400, "C005", " Invalid Type Value"),
    HANDLE_ACCESS_DENIED(403, "C006", "Access is Denied"),

    // User
    USER_NOT_FOUND(500, "U001", "유저가 존재하지 않습니다"),
    EMAIL_DUPLICATED(500, "U002", "이메일이 중복됐습니다"),
    INCORRECT_PASSWORD_PATTERN(500, "U003", "비밀번호 형식이 올바르지 않습니다"),

    // Auth
    PASSWORD_NOT_MATCHED(500, "A001", "비밀번호가 일치하지 않습니다"),

    // Mail
    MAIL_SEND_FAILURE(500, "Ma001", "메일을 보내는 중 오류가 발생했습니다"),
    AUTHENTICATION_CODE_NOT_EXIST(500, "Ma002", "메일 인증 코드가 존재하지 않습니다"),
    AUTHENTICATION_CODE_NOT_MATCHED(500, "Ma003", "인증 코드가 일치하지 않습니다"),

    // PersonalProject
    REPOSITORY_CREATION_ERROR(500, "PP001", "레포지토리 생성 중 오류가 발생했습니다"),
    REPOSITORY_NAME_DUPLICATED(500, "PP002", "레포지토리 이름이 존재합니다"),

    // Message
    MESSAGE_NOT_FOUND(500, "M001", "메시지를 찾을 수 없습니다"),
    MESSAGE_COUNTING_NULL(500, "M002", "메시지 카운팅 중 널 값이 발생했습니다"),

    // WebSocket
    EMAIL_NOT_FOUND(500, "W001", "이메일을 찾을 수 없습니다"),
    INVALID_WEBSOCKET_SESSION(500, "W002", "유효하지 않은 웹소켓 세션입니다");

    private final String code;
    private final String message;
    private final int status;

    ErrorCode(final int status, final String code, final String message) {
        this.status = status;
        this.message = message;
        this.code = code;
    }

    public String getMessage() {
        return this.message;
    }

    public String getCode() {
        return code;
    }

    public int getStatus() {
        return status;
    }

}

