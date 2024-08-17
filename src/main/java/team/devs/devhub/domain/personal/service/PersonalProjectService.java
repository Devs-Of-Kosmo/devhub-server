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
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.RepositoryUtil;
import team.devs.devhub.global.util.VersionControlUtil;

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
    @Value("${business.personal.repository.path}")
    private String repositoryPathHead;
    @Value("${business.personal.multipart.max-size}")
    private long uploadFileMaxSize;

    public PersonalProjectRepoCreateResponse saveProjectRepo(PersonalProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        PersonalProject project = request.toEntity(user);

        validRepositoryName(project);
        personalProjectRepository.save(project);
        project.saveRepositoryPath(repositoryPathHead);

        RepositoryUtil.createRepository(project);

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

        RepositoryUtil.changeRepositoryName(oldRepoNamePath, project);

        return PersonalProjectRepoUpdateResponse.of(project);
    }

    public void deleteProjectRepo(long projectId, long userId) {
        PersonalProject project = personalProjectRepository.findById(projectId)
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(project, user);

        RepositoryUtil.deleteRepository(project);

        personalProjectRepository.deleteById(project.getId());
    }

    public PersonalProjectInitResponse saveInitialProject(PersonalProjectInitRequest request, long userId) {
        validUploadFileSize(request.getFiles());

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
        validUploadFileSize(request.getFiles());

        PersonalCommit parentCommit = personalCommitRepository.findById(request.getFromCommitId())
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        PersonalProject project = parentCommit.getProject();
        validMatchedProjectMaster(parentCommit.getProject(), user);

        RepositoryUtil.deleteFileForCommit(project);
        RepositoryUtil.saveProjectFiles(project, request.getFiles());
        RevCommit newCommit = VersionControlUtil.saveWorkedProject(project, request.getCommitMessage());

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

    @Transactional(readOnly = true)
    public InputStreamResource readImageFileContent(long commitId, String filePath, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        byte[] fileBytes = VersionControlUtil.getFileDataFromCommit(commit, filePath);
        ByteArrayInputStream inputStream = new ByteArrayInputStream(fileBytes);

        return new InputStreamResource(inputStream);
    }

    public void deleteCommitHistory(long commitId, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validIsExistParentCommit(commit);
        validMatchedProjectMaster(commit.getProject(), user);

        VersionControlUtil.resetCommitHistory(commit);

        personalCommitRepository.deleteById(commit.getId());
    }

    @Transactional(readOnly = true)
    public PersonalProjectDownloadDto provideProjectFilesAsZip(long commitId, long userId) {
        PersonalCommit commit = personalCommitRepository.findById(commitId)
                .orElseThrow(() -> new PersonalCommitNotFoundException(ErrorCode.PERSONAL_COMMIT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(commit.getProject(), user);

        ByteArrayResource resource = new ByteArrayResource(VersionControlUtil.generateProjectFilesAsZip(commit));

        return PersonalProjectDownloadDto.of(resource, commit);
    }

    private long getFilesSize(List<MultipartFile> files) {
        return files.stream()
                .mapToLong(MultipartFile::getSize)
                .sum();
    }

    // exception
    private void validRepositoryName(PersonalProject project) {
        if (personalProjectRepository.existsByMasterAndName(project.getMaster(), project.getName())) {
            throw new RepositoryDuplicateException(ErrorCode.REPOSITORY_NAME_DUPLICATED);
        }
    }

    private void validUploadFileSize(List<MultipartFile> files) {
        if (getFilesSize(files) > uploadFileMaxSize) {
            throw new FileSizeOverException(ErrorCode.UPLOAD_FILE_SIZE_OVER);
        }
    }

    private void validMatchedProjectMaster(PersonalProject project, User user) {
        if (project.getMaster().getId() != user.getId()) {
            throw new PersonalProjectMasterNotMatchException(ErrorCode.PERSONAL_PROJECT_MASTER_NOT_MATCH);
        }
    }

    private void validIsExistParentCommit(PersonalCommit commit) {
        if (commit.getParentCommit() == null) {
            throw new ParentCommitNotFoundException(ErrorCode.PARENT_COMMIT_NOT_FOUND);
        }
    }

}
