package team.devs.devhub.domain.team.domain.team;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Objects;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class UserTeamId implements Serializable {

    private Long user;
    private Long team;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserTeamId userTeamId = (UserTeamId) o;
        return Objects.equals(user, userTeamId.user) && Objects.equals(team, userTeamId.team);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, team);
    }
}
