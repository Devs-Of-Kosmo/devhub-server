package team.devs.devhub.domain.personalproject.service;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.revwalk.RevCommit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;
import team.devs.devhub.domain.personalproject.domain.repository.PersonalCommitRepository;
import team.devs.devhub.domain.personalproject.domain.repository.PersonalProjectRepository;
import team.devs.devhub.domain.personalproject.dto.*;
import team.devs.devhub.domain.personalproject.exception.DuplicatedRepositoryException;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.NotMatchedPersonalProjectMasterException;
import team.devs.devhub.domain.personalproject.exception.PersonalCommitNotFoundException;
import team.devs.devhub.domain.personalproject.exception.PersonalProjectNotFoundException;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.RepositoryUtil;
import team.devs.devhub.global.util.VersionControlUtil;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonalProjectService {

    private final UserRepository userRepository;
    private final PersonalProjectRepository personalProjectRepository;
    private final PersonalCommitRepository personalCommitRepository;
    @Value("${repository.path.personal}")
    private String repositoryPathHead;

    public PersonalProjectRepoCreateResponse saveProjectRepo(PersonalProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        PersonalProject project = request.toEntity(user);

        validRepositoryName(project);
        personalProjectRepository.save(project);
        project.createRepositoryPath(repositoryPathHead);

        RepositoryUtil.createRepository(project);

        return PersonalProjectRepoCreateResponse.of(project);
    }

    @Transactional(readOnly = true)
    public List<PersonalProjectRepoReadResponse> readProjectRepo(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<PersonalProjectRepoReadResponse> results = personalProjectRepository.findAllByMaster(user)
                .stream().map(e -> PersonalProjectRepoReadResponse.of(e))
                .collect(Collectors.toList());

        return results;
    }

    public PersonalProjectInitResponse saveInitialProject(PersonalProjectInitRequest request, long userId) {
        PersonalProject project = personalProjectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);

        RepositoryUtil.saveProjectFiles(project, request.getFiles());
        VersionControlUtil.createGitIgnoreFile(project);
        RevCommit newCommit = VersionControlUtil.initializeProject(project, request.getCommitMessage());

        PersonalCommit commit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(newCommit.getName())
                        .commitMessage(request.getCommitMessage())
                        .project(project)
                        .master(user)
                        .build()
        );

        return PersonalProjectInitResponse.of(commit);
    }

    public PersonalProjectSaveResponse saveWorkedProject(PersonalProjectSaveRequest request, long userId) {
        PersonalCommit parentCommit = personalCommitRepository.findById(request.getFromCommitId())
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        PersonalProject project = parentCommit.getProject();
        validMatchedProjectMaster(parentCommit.getProject(), user);

        RepositoryUtil.deleteDirectory(project);
        RepositoryUtil.saveProjectFiles(project, request.getFiles());
        RevCommit newCommit = VersionControlUtil.saveWorkedProject(project, request.getCommitMessage());

        PersonalCommit commit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(newCommit.getName())
                        .parentCommitCode(parentCommit.getCommitCode())
                        .commitMessage(request.getCommitMessage())
                        .project(project)
                        .master(user)
                        .build()
        );

        return PersonalProjectSaveResponse.of(commit);
    }

    @Transactional(readOnly = true)
    public PersonalProjectMetaReadResponse readProjectMetadata(long projectId, long userId) {
        PersonalProject project = personalProjectRepository.findById(projectId)
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);

        return PersonalProjectMetaReadResponse.of(project);
    }

    @Transactional(readOnly = true)
    public PersonalProjectCommitReadResponse readProjectCommit(long commitId, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        List<String> results = VersionControlUtil.getFileNameWithPathList(commit);

        return PersonalProjectCommitReadResponse.of(results);
    }

    @Transactional(readOnly = true)
    public String readTextFileContent(long commitId, String filePath, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        return new String(VersionControlUtil.getFileDataFromCommit(commit, filePath));
    }

    // exception
    private void validRepositoryName(PersonalProject project) {
        if (personalProjectRepository.existsByMasterAndName(project.getMaster(), project.getName())) {
            throw new DuplicatedRepositoryException(ErrorCode.REPOSITORY_NAME_DUPLICATED);
        }
    }

    private void validMatchedProjectMaster(PersonalProject project, User user) {
        if (project.getMaster().getId() != user.getId()) {
            throw new NotMatchedPersonalProjectMasterException(ErrorCode.PERSONAL_PROJECT_MASTER_NOT_MATCH);
        }
    }
}
