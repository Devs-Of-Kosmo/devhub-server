package team.devs.devhub.domain.team.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.team.domain.team.repository.TeamRepository;
import team.devs.devhub.domain.team.domain.team.repository.UserTeamRepository;
import team.devs.devhub.domain.team.dto.TeamDetailsReadResponse;
import team.devs.devhub.domain.team.dto.TeamGroupCreateRequest;
import team.devs.devhub.domain.team.dto.TeamGroupCreateResponse;
import team.devs.devhub.domain.team.dto.TeamGroupReadResponse;
import team.devs.devhub.domain.team.exception.TeamNameDuplicatedException;
import team.devs.devhub.domain.team.exception.TeamNotFoundException;
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

    public TeamGroupCreateResponse saveTeamGroup(TeamGroupCreateRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Team team = request.toEntity(user);
        validDuplicatedTeamName(team);

        Team savedTeam = teamRepository.save(team);

        userTeamRepository.save(
                UserTeam.builder()
                .user(user)
                .team(savedTeam)
                .role(TeamRole.MANAGER)
                .build()
        );

        return TeamGroupCreateResponse.of(team);
    }

    @Transactional(readOnly = true)
    public List<TeamGroupReadResponse> readTeamGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<TeamGroupReadResponse> results = userTeamRepository.findAllByUser(user).stream()
                .map(e -> TeamGroupReadResponse.of(e.getTeam()))
                .collect(Collectors.toList());

        return results;
    }

    public TeamDetailsReadResponse readTeamDetails(Long teamId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validExistsUserAndTeam(user, team);

        List<UserTeam> userTeamList = userTeamRepository.findAllByTeam(team);

        return TeamDetailsReadResponse.of(userTeamList);
    }

    // exception
    private void validDuplicatedTeamName(Team team) {
        if (teamRepository.existsByName(team.getName())) {
            throw new TeamNameDuplicatedException(ErrorCode.TEAM_NAME_DUPLICATED);
        }
    }

    private void validExistsUserAndTeam(User user, Team team) {
        if (!userTeamRepository.existsByUserAndTeam(user, team)) {
            throw new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND);
        }
    }

}
