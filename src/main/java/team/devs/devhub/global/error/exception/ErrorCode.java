package team.devs.devhub.global.error.exception;

public enum ErrorCode {

    // Common
    INVALID_INPUT_VALUE(400, "C001", " Invalid Input Value"),
    METHOD_NOT_ALLOWED(405, "C002", " Invalid Input Value"),
    INTERNAL_SERVER_ERROR(500, "C004", "Server Error"),
    INVALID_TYPE_VALUE(400, "C005", " Invalid Type Value"),
    HANDLE_ACCESS_DENIED(403, "C006", "Access is Denied"),
    PASSWORD_NOT_MATCHED(500, "C007", "Password Not Matched"),

    // User
    USER_NOT_FOUND(500, "U001", "User Not Found Error"),
    EMAIL_DUPLICATED(500, "U002", "Duplicated Email"),
    INCORRECT_PASSWORD_PATTERN(500, "U003", "Incorrect Password Pattern");


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

