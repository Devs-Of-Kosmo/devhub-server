package team.devs.devhub.domain.team.domain.team;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.DynamicInsert;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.BaseTimeEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Getter
@DynamicInsert
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Team extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_id")
    private Long id;

    @Column(length = 20, nullable = false, unique = true)
    private String name;

    @ColumnDefault("''")
    @Column(length = 100)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ColumnDefault("false")
    @Column(length = 20, nullable = false)
    private boolean deleteCondition;

    @OneToMany(mappedBy = "team", cascade = CascadeType.PERSIST)
    private List<UserTeam> affiliatedUsers = new ArrayList<>();

    @OneToMany(mappedBy = "team", cascade = CascadeType.PERSIST)
    private List<TeamProject> projects = new ArrayList<>();

    @Builder
    public Team(Long id, String name, String description, User createdBy) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.createdBy = createdBy;
    }

    public void update(Team team) {
        this.name = team.getName();
        this.description = team.getDescription();
    }

    public void softDelete() {
        this.deleteCondition = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Team team = (Team) o;
        return Objects.equals(id, team.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

}
