package team.devs.devhub.domain.personalproject.service;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.revwalk.RevCommit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
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

    public List<PersonalProjectRepoReadResponse> readProjectRepo(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<PersonalProjectRepoReadResponse> results = personalProjectRepository.findAllByMaster(user)
                .stream().map(e -> PersonalProjectRepoReadResponse.of(e))
                .collect(Collectors.toList());

        return results;
    }

    public PersonalProjectInitResponse saveInitialProject(long projectId, List<MultipartFile> files, String commitMessage, long userId) {
        PersonalProject project = personalProjectRepository.findById(projectId)
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);

        RepositoryUtil.saveProjectFiles(project.getRepositoryPath(), files);
        VersionControlUtil.createGitIgnoreFile(project);
        RevCommit newCommit = VersionControlUtil.initializeProject(project, commitMessage);

        PersonalCommit commit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(newCommit.getName())
                        .project(project)
                        .master(user)
                        .build()
        );

        return PersonalProjectInitResponse.of(commit, commitMessage);
    }

    public PersonalProjectSaveResponse saveWorkedProject(long commitId, List<MultipartFile> files, String commitMessage, long userId) {
        PersonalCommit parentCommit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        PersonalProject project = parentCommit.getProject();
        validMatchedProjectMaster(parentCommit.getProject(), user);

        RepositoryUtil.deleteDirectory(project);
        RepositoryUtil.saveProjectFiles(project.getRepositoryPath(), files);
        RevCommit newCommit = VersionControlUtil.saveWorkedProject(project, commitMessage);

        PersonalCommit commit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(newCommit.getName())
                        .parentCommitCode(parentCommit.getCommitCode())
                        .project(project)
                        .master(user)
                        .build()
        );

        return PersonalProjectSaveResponse.of(commit, commitMessage);
    }

    // exception
    private void validRepositoryName(PersonalProject personalProject) {
        if (personalProjectRepository.existsByMasterAndName(personalProject.getMaster(), personalProject.getName())) {
            throw new DuplicatedRepositoryException(ErrorCode.REPOSITORY_NAME_DUPLICATED);
        }
    }

    private void validMatchedProjectMaster(PersonalProject personalProject, User user) {
        if (personalProject.getMaster().getId() != user.getId()) {
            throw new NotMatchedPersonalProjectMasterException(ErrorCode.PERSONAL_PROJECT_MASTER_NOT_MATCH);
        }
    }
}
