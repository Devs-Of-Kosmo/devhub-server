package team.devs.devhub.domain.team.domain.project;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@DynamicInsert
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamProject extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_project_id")
    private Long id;

    @Column(length = 20, nullable = false)
    private String name;

    @ColumnDefault("''")
    @Column(length = 50)
    private String description;

    @Column(length = 150)
    private String repositoryPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "create_by", nullable = false)
    private User createdBy;

    @ColumnDefault("false")
    @Column(length = 20, nullable = false)
    private boolean deleteCondition;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TeamBranch> branches = new ArrayList<>();

    @Builder
    public TeamProject(Long id, String name, String description, String repositoryPath, Team team, User createdBy, boolean deleteCondition) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.repositoryPath = repositoryPath;
        this.team = team;
        this.createdBy = createdBy;
        this.deleteCondition = deleteCondition;
    }

}
