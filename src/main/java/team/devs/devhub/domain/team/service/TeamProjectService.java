package team.devs.devhub.domain.team.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.team.domain.project.repository.TeamProjectRepository;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.team.domain.team.repository.TeamRepository;
import team.devs.devhub.domain.team.domain.team.repository.UserTeamRepository;
import team.devs.devhub.domain.team.dto.project.TeamProjectRepoCreateRequest;
import team.devs.devhub.domain.team.dto.project.TeamProjectRepoCreateResponse;
import team.devs.devhub.domain.team.exception.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.RepositoryUtil;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamProjectService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserTeamRepository userTeamRepository;
    private final TeamProjectRepository teamProjectRepository;
    @Value("${business.team.repository.path}")
    private String repositoryPathHead;

    public TeamProjectRepoCreateResponse saveProjectRepo(TeamProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validExistsUserAndTeam(user, team);

        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        TeamProject project = request.toEntity(team, user);

        validDuplicatedProjectName(project);
        teamProjectRepository.save(project);
        project.saveRepositoryPath(repositoryPathHead);

        RepositoryUtil.createRepository(project);

        return TeamProjectRepoCreateResponse.of(project);
    }

    // exception
    private void validDuplicatedProjectName(TeamProject teamProject) {
        if (teamProjectRepository.existsByTeamIdAndName(teamProject.getTeam().getId(), teamProject.getName())) {
            throw new TeamProjectNameDuplicatedException(ErrorCode.TEAM_PROJECT_NAME_DUPLICATED);
        }
    }

    private void validExistsUserAndTeam(User user, Team team) {
        if (!userTeamRepository.existsByUserAndTeam(user, team)) {
            throw new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND);
        }
    }

    private void validSubManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER
                || userTeam.getRole() == TeamRole.SUB_MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_SUB_MANAGER_OR_HIGHER);
        }
    }
}
