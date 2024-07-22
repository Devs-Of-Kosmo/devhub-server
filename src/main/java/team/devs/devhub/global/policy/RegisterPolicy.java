package team.devs.devhub.global.policy;

public enum RegisterPolicy {
    PASSWORD_PATTERN("^(?=.*[@$!%*?&]).{8,}$");

    private final String value;

    RegisterPolicy(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
