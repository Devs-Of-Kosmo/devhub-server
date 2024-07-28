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
import team.devs.devhub.domain.personalproject.dto.PersonalProjectInitResponse;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoReadResponse;
import team.devs.devhub.domain.personalproject.exception.DuplicatedRepositoryException;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoCreateRequest;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoCreateResponse;
import team.devs.devhub.domain.personalproject.exception.NotMatchedPersonalProjectMasterException;
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

        PersonalProject personalProject = request.toEntity(user);

        validRepositoryName(personalProject);
        personalProjectRepository.save(personalProject);
        personalProject.createRepositoryPath(repositoryPathHead);

        RepositoryUtil.createRepository(personalProject);

        return PersonalProjectRepoCreateResponse.of(personalProject);
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
        PersonalProject personalProject = personalProjectRepository.findById(projectId)
                .orElseThrow(() -> new PersonalProjectNotFoundException(ErrorCode.PERSONAL_PROJECT_NOT_FOUND));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        validMatchedProjectMaster(personalProject, user);

        RepositoryUtil.saveProjectFiles(personalProject.getRepositoryPath(), files);
        VersionControlUtil.createGitIgnoreFile(personalProject);
        RevCommit commit = VersionControlUtil.initializeProject(personalProject, commitMessage);

        PersonalCommit personalCommit = personalCommitRepository.save(
                PersonalCommit.builder()
                        .commitCode(commit.getName())
                        .project(personalProject)
                        .master(user)
                        .build()
        );

        return PersonalProjectInitResponse.of(personalCommit, commitMessage);
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
