package team.devs.devhub.domain.team.domain.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@DynamicInsert
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamCommit extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_commit_id")
    private Long id;

    @Column(length = 40, nullable = false)
    private String commitCode;

    @ColumnDefault("''")
    @Column(length = 200, nullable = false)
    private String commitMessage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private TeamBranch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_commit_id")
    private TeamCommit parentCommit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "parentCommit", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TeamCommit> childCommits = new ArrayList<>();

    @Builder
    public TeamCommit(Long id, String commitCode, String commitMessage, TeamBranch branch, TeamCommit parentCommit, User createdBy) {
        this.id = id;
        this.commitCode = commitCode;
        this.commitMessage = commitMessage;
        this.branch = branch;
        this.parentCommit = parentCommit;
        this.createdBy = createdBy;
    }

}
