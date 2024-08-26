package team.devs.devhub.domain.team.domain.project;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.SQLDelete;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;
import team.devs.devhub.global.common.ProjectUtilProvider;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@DynamicInsert
@SQLDelete(sql = "UPDATE team_project SET delete_condition = true WHERE team_project_id = ?")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TeamProject extends BaseTimeEntity implements ProjectUtilProvider {

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
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ColumnDefault("false")
    @Column(length = 20, nullable = false)
    private boolean deleteCondition;

    @OneToMany(mappedBy = "project", cascade = CascadeType.PERSIST)
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

    public void update(TeamProject project) {
        this.name = project.getName();
        this.description = project.getDescription();
    }

    public void saveRepositoryPath(String repositoryPathHead) {
        this.repositoryPath = repositoryPathHead
                + team.getId() + "_" + team.getName() + "/"
                + name + "_" + getCreatedDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + "/";
    }

}
