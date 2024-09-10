package team.devs.devhub.domain.team.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.team.domain.team.repository.TeamRepository;
import team.devs.devhub.domain.team.domain.team.repository.UserTeamRepository;
import team.devs.devhub.domain.team.dto.team.*;
import team.devs.devhub.domain.team.exception.TeamNotFoundException;
import team.devs.devhub.domain.team.exception.TeamRoleUnauthorizedException;
import team.devs.devhub.domain.team.exception.UserTeamNotFoundException;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserTeamRepository userTeamRepository;

    public TeamGroupCreateResponse saveTeamGroup(TeamGroupCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Team prePersistTeam = request.toEntity(user);

        Team team = teamRepository.save(prePersistTeam);

        userTeamRepository.save(
                UserTeam.builder()
                .user(user)
                .team(team)
                .role(TeamRole.MANAGER)
                .build()
        );

        return TeamGroupCreateResponse.of(team);
    }

    @Transactional(readOnly = true)
    public List<TeamGroupReadResponse> readTeamGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<TeamGroupReadResponse> results = userTeamRepository.findAllByUserFetchJoinTeam(user).stream()
                .map(e -> TeamGroupReadResponse.of(e.getTeam()))
                .collect(Collectors.toList());

        return results;
    }

    @Transactional(readOnly = true)
    public TeamDetailsReadResponse readTeamDetails(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validExistsUserAndTeam(user, team);

        List<UserTeam> userTeamList = userTeamRepository.findAllByTeamFetchJoinUserAndTeam(team);

        return TeamDetailsReadResponse.of(userTeamList);
    }

    public TeamGroupUpdateResponse updateTeamInfo(TeamGroupUpdateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        Team target = request.toEntity();

        team.update(target);

        return TeamGroupUpdateResponse.of(team);
    }

    public void deleteTeam(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validManagerOrHigher(userTeam);

        team.softDelete();
    }

    public void updateDeleteCancelTeam(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validManagerOrHigher(userTeam);

        team.cancelSoftDelete();
    }

    public void deleteAffiliatedUser(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validIsManager(userTeam);

        userTeamRepository.deleteByUserIdAndTeamId(user.getId(), team.getId());
    }

    // exception
    private void validExistsUserAndTeam(User user, Team team) {
        if (!userTeamRepository.existsByUserAndTeam(user, team)) {
            throw new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND);
        }
    }

    private void validManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_MANAGER_OR_HIGHER);
        }
    }

    private void validSubManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER
                || userTeam.getRole() == TeamRole.SUB_MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_SUB_MANAGER_OR_HIGHER);
        }
    }

    private void validIsManager(UserTeam userTeam) {
        if (userTeam.getRole() == TeamRole.MANAGER) {
            throw new TeamRoleUnauthorizedException(ErrorCode.MANAGER_ACTION_NOT_ALLOWED);
        }
    }
}
