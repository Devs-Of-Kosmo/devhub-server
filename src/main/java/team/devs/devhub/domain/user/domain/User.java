package team.devs.devhub.domain.user.domain;

import jakarta.persistence.*;
import lombok.*;
import team.devs.devhub.global.common.BaseTimeEntity;
import team.devs.devhub.global.common.DeleteCondition;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(length = 50, unique = true, nullable = false, updatable = false)
    private String email;

    @Column(length = 100, nullable = false)
    private String password;

    @Column(length = 10, nullable = false)
    private String name;

    @Column(length = 4, nullable = false)
    private String identificationCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType roleType;

    @Enumerated(EnumType.STRING)
    @Column(length = 1, nullable = false)
    private DeleteCondition deleteCondition;

    @Builder
    public User(Long id, String email, String password, String name, String identificationCode, RoleType roleType, DeleteCondition deleteCondition) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.identificationCode = identificationCode;
        this.roleType = roleType;
        this.deleteCondition = deleteCondition;
    }

}
