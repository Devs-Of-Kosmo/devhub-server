package team.devs.devhub.domain.team.service;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;
import team.devs.devhub.domain.team.domain.project.repository.TeamBranchRepository;
import team.devs.devhub.domain.team.domain.project.repository.TeamCommitRepository;
import team.devs.devhub.global.common.exception.FileSizeOverException;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.team.domain.project.repository.TeamProjectRepository;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.team.domain.team.repository.TeamRepository;
import team.devs.devhub.domain.team.domain.team.repository.UserTeamRepository;
import team.devs.devhub.domain.team.dto.project.*;
import team.devs.devhub.domain.team.exception.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.RepositoryUtil;
import team.devs.devhub.global.util.VersionControlUtil;
import team.devs.devhub.global.util.exception.BranchNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamProjectService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserTeamRepository userTeamRepository;
    private final TeamProjectRepository teamProjectRepository;
    private final TeamBranchRepository teamBranchRepository;
    private final TeamCommitRepository teamCommitRepository;
    @Value("${business.team.repository.path}")
    private String repositoryPathHead;
    @Value("${business.team.multipart.max-size}")
    private long uploadFileMaxSize;

    public TeamProjectRepoCreateResponse saveProjectRepo(TeamProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
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

    @Transactional(readOnly = true)
    public List<TeamProjectRepoReadResponse> readProjectRepo(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validExistsUserAndTeam(user, team);

        List<TeamProjectRepoReadResponse> results = teamProjectRepository.findAllByTeamId(team.getId()).stream()
                .map(e -> TeamProjectRepoReadResponse.of(e))
                .collect(Collectors.toList());

        return results;
    }

    public TeamProjectRepoUpdateResponse updateProjectRepo(TeamProjectRepoUpdateRequest request, long userId) {
        TeamProject project = teamProjectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new TeamProjectNotFoundException(ErrorCode.TEAM_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, project.getTeam())
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        TeamProject target = request.toEntity();

        validDuplicatedProjectName(project.getTeam(), target);

        String oldRepoNamePath = project.getRepositoryPath();

        project.update(target);
        project.saveRepositoryPath(repositoryPathHead);

        RepositoryUtil.changeRepositoryName(oldRepoNamePath, project);

        return TeamProjectRepoUpdateResponse.of(project);
    }

    public void deleteProjectRepo(long projectId, long userId) {
        TeamProject project = teamProjectRepository.findById(projectId)
                .orElseThrow(() -> new TeamProjectNotFoundException(ErrorCode.TEAM_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, project.getTeam())
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        teamProjectRepository.deleteById(projectId);
    }

    public TeamProjectInitResponse saveInitialProject(TeamProjectInitRequest request, long userId) {
        TeamProject project = teamProjectRepository.findByIdForSaveProject(request.getProjectId())
                .orElseThrow(() -> new TeamProjectNotFoundException(ErrorCode.TEAM_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, project.getTeam())
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);
        validExistsProjectBranch(project);
        validUploadFileSize(request.getFiles());

        RepositoryUtil.saveProjectFiles(project, request.getFiles());
        RepositoryUtil.createGitIgnoreFile(project);
        RevCommit newCommit = VersionControlUtil.initializeProject(project, request.getCommitMessage());
        Ref newBranch = VersionControlUtil.getBranch(project, newCommit)
                .orElseThrow(() -> new BranchNotFoundException(ErrorCode.BRANCH_NOT_FOUND));

        TeamBranch branch = teamBranchRepository.save(
                TeamBranch.builder()
                        .name(newBranch.getName())
                        .project(project)
                        .createdBy(user)
                        .build()
        );

        TeamCommit commit = teamCommitRepository.save(
                TeamCommit.builder()
                        .commitCode(newCommit.getName())
                        .commitMessage(request.getCommitMessage())
                        .branch(branch)
                        .createdBy(user)
                        .build()
        );

        return TeamProjectInitResponse.of(branch, commit);
    }

    public TeamProjectBranchCreateResponse saveBranch(TeamProjectBranchCreateRequest request, Long userId) {
        TeamProject project = teamProjectRepository.findByIdForSaveProject(request.getProjectId())
                .orElseThrow(() -> new TeamProjectNotFoundException(ErrorCode.TEAM_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        TeamCommit fromCommit = teamCommitRepository.findById(request.getFromCommitId())
                .orElseThrow(() -> new TeamCommitNotFoundException(ErrorCode.TEAM_COMMIT_NOT_FOUND));
        TeamBranch prePersistBranch = request.toEntity(user, project);

        VersionControlUtil.createBranch(prePersistBranch, fromCommit);

        TeamBranch branch = teamBranchRepository.save(prePersistBranch);

        TeamCommit commit = teamCommitRepository.save(
                TeamCommit.builder()
                        .commitCode(fromCommit.getCommitCode())
                        .commitMessage(fromCommit.getCommitMessage())
                        .branch(branch)
                        .createdBy(user)
                        .build()
        );

        return TeamProjectBranchCreateResponse.of(branch, commit);
    }

    private long getFilesSize(List<MultipartFile> files) {
        return files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();
    }

    // exception
    private void validDuplicatedProjectName(TeamProject project) {
        validDuplicatedProjectName(project.getTeam(), project);
    }

    private void validDuplicatedProjectName(Team team, TeamProject project) {
        if (teamProjectRepository.existsByTeamIdAndName(team.getId(), project.getName())) {
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

    private void validUploadFileSize(List<MultipartFile> files) {
        if (getFilesSize(files) > uploadFileMaxSize) {
            throw new FileSizeOverException(ErrorCode.TEAM_PROJECT_FILE_SIZE_OVER);
        }
    }

    private void validExistsProjectBranch(TeamProject project) {
        if (!project.getBranches().isEmpty()) {
            throw new InitialProjectExistException(ErrorCode.INITIAL_PROJECT_ALREADY_EXIST);
        }
    }
}
