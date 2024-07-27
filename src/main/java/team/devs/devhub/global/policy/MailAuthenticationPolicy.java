package team.devs.devhub.global.policy;

public enum MailAuthenticationPolicy {

    TITLE("[DEVHUB] 이메일 인증 요청 메일입니다.");

    private final String value;

    MailAuthenticationPolicy(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
