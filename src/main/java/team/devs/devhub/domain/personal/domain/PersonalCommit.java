package team.devs.devhub.domain.personal.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;
import team.devs.devhub.global.common.CommitUtilProvider;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@DynamicInsert
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PersonalCommit extends BaseTimeEntity implements CommitUtilProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "personal_commit_id")
    private Long id;

    @Column(length = 40, nullable = false)
    private String commitCode;

    @ColumnDefault("''")
    @Column(length = 200, nullable = false)
    private String commitMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PersonalProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_id", nullable = false)
    private User master;

    @OneToMany(mappedBy = "parentCommit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PersonalCommit> childCommits = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_commit_id")
    private PersonalCommit parentCommit;

    @Builder
    public PersonalCommit(Long id, String commitCode, String commitMessage, PersonalProject project, User master, PersonalCommit parentCommit) {
        this.id = id;
        this.commitCode = commitCode;
        this.commitMessage = commitMessage;
        this.project = project;
        this.master = master;
        this.parentCommit = parentCommit;
    }

    @Override
    public String getRepositoryPath() {
        return project.getRepositoryPath();
    }

    @Override
    public String getCommitCode() {
        return commitCode;
    }
}
