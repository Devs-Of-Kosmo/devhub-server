package team.devs.devhub.domain.personal.domain;

import jakarta.persistence.*;
import lombok.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;
import team.devs.devhub.global.common.ProjectUtilProvider;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PersonalProject extends BaseTimeEntity implements ProjectUtilProvider {

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

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PersonalCommit> personalCommits = new ArrayList<>();

    @Builder
    public PersonalProject(Long id, String name, String description, String repositoryPath, User master) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.repositoryPath = repositoryPath;
        this.master = master;
    }

    public void saveRepositoryPath(String repositoryPathHead) {
        this.repositoryPath = repositoryPathHead
                + master.getId() + "_" + master.getName() + "/"
                + name + "_" + getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "/";
    }

    public void update(PersonalProject project) {
        this.name = project.getName();
        this.description = project.getDescription();
    }
}
