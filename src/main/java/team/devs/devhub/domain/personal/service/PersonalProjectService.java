package team.devs.devhub.domain.personal.service;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.revwalk.RevCommit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.personal.domain.PersonalCommit;
import team.devs.devhub.domain.personal.domain.repository.PersonalCommitRepository;
import team.devs.devhub.domain.personal.domain.repository.PersonalProjectRepository;
import team.devs.devhub.domain.personal.dto.*;
import team.devs.devhub.domain.personal.exception.*;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.common.exception.FileSizeOverException;
import team.devs.devhub.global.common.exception.ParentCommitNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.*;

import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonalProjectService {

    private final UserRepository userRepository;
    private final PersonalProjectRepository personalProjectRepository;
    private final PersonalCommitRepository personalCommitRepository;
    private final GitUtil gitUtil;
    @Value("${business.personal.repository.path}")
    private String repositoryPathHead;
    @Value("${business.personal.multipart.max-size}")
    private long uploadFileMaxSize;

    public PersonalProjectRepoCreateResponse saveProjectRepo(PersonalProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        PersonalProject project = request.toEntity(user);

        validRepositoryCount(user);
        validRepositoryName(project);
        personalProjectRepository.save(project);
        project.saveRepositoryPath(repositoryPathHead);

        RepositoryUtil repositoryUtil = new RepositoryUtil(project);
        repositoryUtil.createRepository();

        return PersonalProjectRepoCreateResponse.of(project);
    }

    @Transactional(readOnly = true)
    public List<PersonalProjectRepoReadResponse> readProjectRepo(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<PersonalProjectRepoReadResponse> results = personalProjectRepository.findAllByMaster(user).stream()
                .map(e -> PersonalProjectRepoReadResponse.of(e))
                .collect(Collectors.toList());

        return results;
    }

    public PersonalProjectRepoUpdateResponse updateProjectRepo(PersonalProjectRepoUpdateRequest request, long userId) {
        PersonalProject project = personalProjectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        PersonalProject target = request.toEntity();
        validMatchedProjectMaster(project, user);
        validRepositoryName(target);

        String oldRepoNamePath = project.getRepositoryPath();
        project.update(target);
        project.saveRepositoryPath(repositoryPathHead);

        RepositoryUtil repositoryUtil = new RepositoryUtil(project);
        repositoryUtil.changeRepositoryName(oldRepoNamePath);

        return PersonalProjectRepoUpdateResponse.of(project);
    }

    public void deleteProjectRepo(long projectId, long userId) {
        PersonalProject project = personalProjectRepository.findById(projectId)
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);

        RepositoryUtil repositoryUtil = new RepositoryUtil(project);
        repositoryUtil.deleteRepository();

        personalProjectRepository.deleteById(project.getId());
    }

    public PersonalProjectInitResponse saveInitialProject(PersonalProjectInitRequest request, long userId) {
        PersonalProject project = personalProjectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);
        validUploadFileSize(request.getFiles());

        RepositoryUtil repositoryUtil = new RepositoryUtil(project);
        repositoryUtil.saveProjectFiles(request.getFiles());
        repositoryUtil.createGitIgnoreFile();

        ProjectUtil projectUtil = new ProjectUtil(gitUtil);
        RevCommit newCommit = projectUtil.initializeProject(project, request.getCommitMessage());

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
        validUploadFileSize(request.getFiles());

        RepositoryUtil repositoryUtil = new RepositoryUtil(project);
        repositoryUtil.deleteFileForCommit();
        repositoryUtil.saveProjectFiles(request.getFiles());

        ProjectUtil projectUtil = new ProjectUtil(gitUtil);
        RevCommit newCommit = projectUtil.saveWorkedProject(project, request.getCommitMessage());

        PersonalCommit commit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(newCommit.getName())
                        .commitMessage(request.getCommitMessage())
                        .project(project)
                        .master(user)
                        .parentCommit(parentCommit)
                        .build()
        );

        return PersonalProjectSaveResponse.of(commit);
    }

    @Transactional(readOnly = true)
    public PersonalProjectMetaReadResponse readProjectMetadata(long projectId, long userId) {
        PersonalProject project = personalProjectRepository.findByIdFetchJoinCommits(projectId)
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

        CommitUtil commitUtil = new CommitUtil(gitUtil);
        List<String> results = commitUtil.getFileNameWithPathList(commit);

        return PersonalProjectCommitReadResponse.of(results);
    }

    @Transactional(readOnly = true)
    public String readTextFileContent(long commitId, String filePath, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        CommitUtil commitUtil = new CommitUtil(gitUtil);
        byte[] fileData = commitUtil.getFileDataFromCommit(commit, filePath);

        return new String(fileData);
    }

    @Transactional(readOnly = true)
    public InputStreamResource readImageFileContent(long commitId, String filePath, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        CommitUtil commitUtil = new CommitUtil(gitUtil);
        byte[] fileData = commitUtil.getFileDataFromCommit(commit, filePath);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(fileData);

        return new InputStreamResource(inputStream);
    }

    public void deleteCommitHistory(long commitId, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validIsExistParentCommit(commit);
        validMatchedProjectMaster(commit.getProject(), user);

        CommitUtil commitUtil = new CommitUtil(gitUtil);
        commitUtil.resetCommitHistory(commit);

        personalCommitRepository.deleteById(commit.getId());
    }

    @Transactional(readOnly = true)
    public PersonalProjectDownloadDto provideProjectFilesAsZip(long commitId, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        CommitUtil commitUtil = new CommitUtil(gitUtil);
        byte[] fileData = commitUtil.createProjectFilesAsZip(commit);
        ByteArrayResource resource = new ByteArrayResource(fileData);

        return PersonalProjectDownloadDto.of(resource, commit);
    }

    private long getFilesSize(List<MultipartFile> files) {
        return files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();
    }

    // exception
    private void validRepositoryCount(User user) {
        if (personalProjectRepository.countByMasterId(user.getId()) >= 10) {
            throw new RepositoryLimitExceededException(ErrorCode.REPOSITORY_LIMIT_EXCEEDED);
        }
    }

    private void validRepositoryName(PersonalProject project) {
        if (personalProjectRepository.existsByMasterAndName(project.getMaster(), project.getName())) {
            throw new RepositoryDuplicateException(ErrorCode.REPOSITORY_NAME_DUPLICATED);
        }
    }

    private void validUploadFileSize(List<MultipartFile> files) {
        if (getFilesSize(files) > uploadFileMaxSize) {
            throw new FileSizeOverException(ErrorCode.PERSONAL_PROJECT_FILE_SIZE_OVER);
        }
    }

    private void validMatchedProjectMaster(PersonalProject project, User user) {
        if (project.getMaster().getId() != user.getId()) {
            throw new PersonalProjectMasterNotMatchException(ErrorCode.PERSONAL_PROJECT_MASTER_NOT_MATCH);
        }
    }

    private void validIsExistParentCommit(PersonalCommit commit) {
        if (commit.getParentCommit() == null) {
            throw new ParentCommitNotFoundException(ErrorCode.PERSONAL_PARENT_COMMIT_NOT_EXIST);
        }
    }

}
