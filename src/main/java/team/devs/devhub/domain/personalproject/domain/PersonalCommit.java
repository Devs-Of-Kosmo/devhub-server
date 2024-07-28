package team.devs.devhub.domain.personalproject.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.SQLDelete;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

@Entity
@Getter
@DynamicInsert
@SQLDelete(sql = "UPDATE personal_commit SET delete_condition = true WHERE personal_commit_id = ?")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PersonalCommit extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "personal_commit_id")
    private Long id;

    @Column(length = 40, nullable = false)
    private String commitCode;

    @Column(length = 40)
    private String parentCommitCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private PersonalProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_id", nullable = false)
    private User master;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean deleteCondition;

    @Builder
    public PersonalCommit(Long id, String commitCode, String parentCommitCode, PersonalProject project, User master) {
        this.id = id;
        this.commitCode = commitCode;
        this.parentCommitCode = parentCommitCode;
        this.project = project;
        this.master = master;
    }
}
