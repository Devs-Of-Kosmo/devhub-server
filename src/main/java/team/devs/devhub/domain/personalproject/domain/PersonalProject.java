package team.devs.devhub.domain.personalproject.domain;

import jakarta.persistence.*;
import lombok.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.time.format.DateTimeFormatter;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class PersonalProject extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "personal_project_id")
    private Long id;

    @Column(length = 20, nullable = false)
    private String name;

    @Column(length = 50)
    private String description;

    @Column(length = 150)
    private String repositoryPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_id", nullable = false)
    private User master;

    @Builder
    public PersonalProject(Long id, String name, String description, String repositoryPath, User master) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.repositoryPath = repositoryPath;
        this.master = master;
    }

    public void createRepositoryPath(String fixedPathHead) {
        this.repositoryPath = fixedPathHead
                + master.getId() + "_" + master.getName() + "/"
                + name + "_" + getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "/";
    }
}
