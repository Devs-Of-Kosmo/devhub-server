package team.devs.devhub.domain.team.domain.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.DynamicInsert;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@DynamicInsert
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamBranch extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_branch_id")
    private Long id;

    @Column(length = 20, nullable = false)
    private String name;

    @Column(length = 100)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private TeamProject project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "branch", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TeamCommit> commits = new ArrayList<>();

    @Builder
    public TeamBranch(Long id, String name, String description, TeamProject project, User createdBy) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.project = project;
        this.createdBy = createdBy;
    }

}
