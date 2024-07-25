package team.devs.devhub.domain.user.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import team.devs.devhub.domain.message.domain.Message;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
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

    @Column(nullable = false)
    private Integer identificationCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleType roleType;

    @OneToMany(mappedBy = "master", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PersonalProject> personalProjects = new ArrayList<>();

    @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> senderMessages = new ArrayList<>();

    @OneToMany(mappedBy = "receiver", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> receiverMessages = new ArrayList<>();

    @Builder
    public User(Long id, String email, String password, String name, Integer identificationCode, RoleType roleType) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.name = name;
        this.identificationCode = identificationCode;
        this.roleType = roleType;
    }

    public void encodePassword(PasswordEncoder passwordEncoder) {
        this.password = passwordEncoder.encode(this.password);
    }

    public void assignIdentificationCode(int maxIdentificationCode) {
        this.identificationCode = maxIdentificationCode + 1;
    }

}
