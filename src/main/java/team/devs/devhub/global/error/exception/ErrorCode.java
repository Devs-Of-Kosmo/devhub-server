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

    // Personal
    REPOSITORY_CREATION_ERROR(500, "P001", "레포지토리 생성 중 오류가 발생했습니다"),
    REPOSITORY_NAME_DUPLICATED(500, "P002", "레포지토리 이름이 존재합니다"),
    PERSONAL_PROJECT_NOT_FOUND(500, "P003", "개인 프로젝트를 찾을 수 없습니다"),
    REPOSITORY_LIMIT_EXCEEDED(500, "P004", "개인 레포지토리 갯수는 최대 10개까지 생성할 수 있습니다"),
    PERSONAL_PROJECT_MASTER_NOT_MATCH(500, "P005", "프로젝트 소유자가 일치하지 않습니다"),
    PERSONAL_COMMIT_NOT_FOUND(500, "P006", "해당 커밋을 찾을 수 없습니다"),
    DIRECTORY_DELETE_ERROR(500, "P007", "프로젝트 파일을 삭제하는 중 오류가 발생했습니다"),
    COMMIT_SEARCH_ERROR(500, "P008", "커밋 이름 탐색 중 오류가 발생했습니다"),
    FILE_NOT_FOUND(500, "P009", "파일을 찾지 못했습니다"),
    FILE_SEARCH_ERROR(500, "P010", "파일을 찾는 중 오류가 발생했습니다"),
    ZIP_FILE_GENERATE_ERROR(500, "P012", "zip파일 생성 중 오류가 발생했습니다"),
    REPOSITORY_UPDATE_ERROR(500, "P013", "레포지토리 업데이트 중 오류가 발생했습니다"),
    REPOSITORY_DELETE_ERROR(500, "P014", "레포지토리를 삭제하는 중 오류가 발생했습니다"),
    PERSONAL_PARENT_COMMIT_NOT_EXIST(500, "P015", "부모 커밋이 존재하지 않습니다"),
    PERSONAL_PROJECT_FILE_SIZE_OVER(500, "P016", "업로드한 파일의 용량이 100MB를 초과했습니다"),

    // Team
    TEAM_BRANCH_DUPLICATED(500, "T001", "브랜치 이름이 존재합니다"),
    TEAM_NOT_FOUND(500, "T002", "팀이 존재하지 않습니다"),
    USER_TEAM_NOT_FOUND(500, "T003", "유저와 일치하는 팀이 존재하지 않습니다"),
    NOT_SUB_MANAGER_OR_HIGHER(500, "T004", "SUB_MANAGER 이상의 권환이 필요합니다"),
    NOT_MANAGER_OR_HIGHER(500, "T005", "MANAGER 이상의 권환이 필요합니다"),
    TEAM_PROJECT_NAME_DUPLICATED(500, "T006", "팀 프로젝트 이름이 존재합니다"),
    TEAM_PROJECT_NOT_FOUND(500, "T007", "프로젝트가 존재하지 않습니다"),
    TEAM_PROJECT_FILE_SIZE_OVER(500, "T008", "업로드한 파일의 용량이 200MB를 초과했습니다"),
    INITIAL_PROJECT_ALREADY_EXIST(500, "T009", "최초 저장한 프로젝트가 이미 존재합니다"),
    TEAM_COMMIT_NOT_FOUND(500, "T010", "커밋이 존재하지 않습니다"),
    TEAM_BRANCH_NOT_FOUND(500, "T011", "브랜치가 존재하지 않습니다"),
    USER_BRANCH_MISMATCH(500, "T012", "해당 브랜치를 생성한 유저가 아닙니다"),
    PROHIBITED_BRANCH_NAME(500, "T013", "브랜치 이름으로 'main' 또는 'master'는 불가능합니다"),
    DEFAULT_BRANCH_NOT_ALLOWED(500, "T014", "기본 브랜치는 삭제하실 수 없습니다"),
    USER_COMMIT_MISMATCH(500, "T015", "해당 커밋을 생성한 유저가 아닙니다"),
    TEAM_PARENT_COMMIT_NOT_EXIST(500, "T016", "부모 커밋이 존재하지 않습니다"),
    DEFAULT_BRANCH_COMMIT_NOT_ALLOWED(500, "T017", "기본 브랜치의 커밋은 삭제하실 수 없습니다"),

    // Board
    BOARD_NOT_FOUND(500,"B001", "게시글을 찾을 수 없습니다"),
    BOARD_UPDATE(500,"B002", "게시글 수정 권한이 없습니다"),
    BOARD_DELETE(500,"B003", "게시글을 삭제 권한이 없습니다"),
    IMAGE_SAVE(500,"B004", "이미지 저장에 실패했습니다"),

    // Message
    MESSAGE_NOT_FOUND(500, "M001", "메시지를 찾을 수 없습니다"),
    MESSAGE_COUNTING_NULL(500, "M002", "메시지 카운팅 중 널 값이 발생했습니다"),

    // WebSocket
    EMAIL_NOT_FOUND(500, "W001", "이메일을 찾을 수 없습니다"),
    INVALID_WEBSOCKET_SESSION(500, "W002", "유효하지 않은 웹소켓 세션입니다"),

    // VersionControlUtil
    BRANCH_SEARCH_ERROR(500, "V001", "브랜치 탐색 과정 중 오류가 발생했습니다"),
    BRANCH_NOT_FOUND(500, "V002", "브랜치가 존재하지 않습니다"),
    PROJECT_SAVE_ERROR(500, "V003", "프로젝트 저장 중 오류가 발생했습니다"),
    GIT_ROLLBACK_ERROR(500, "V004", "깃 상태 롤백 중 오류가 발생했습니다"),
    COMMIT_RESET_ERROR(500, "V005", "커밋 삭제 중 오류가 발생했습니다"),
    BRANCH_CREATION_ERROR(500, "V005", "브랜치 생성 중 오류가 발생했습니다"),
    BRANCH_DELETE_ERROR(500, "V006", "브랜치 삭제 중 오류가 발생했습니다");

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

