package team.devs.devhub.domain.personalproject.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.personalproject.domain.repository.PersonalProjectRepository;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoReadResponse;
import team.devs.devhub.domain.personalproject.exception.DuplicatedRepositoryException;
import team.devs.devhub.domain.personalproject.exception.RepositoryCreationException;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoCreateRequest;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectRepoCreateResponse;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class PersonalProjectService {

    private final UserRepository userRepository;
    private final PersonalProjectRepository personalProjectRepository;
    @Value("${repository.path.personal}")
    private String fixedPathHead;

    public PersonalProjectRepoCreateResponse savePersonalProject(PersonalProjectRepoCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        PersonalProject personalProject = request.toEntity(user);

        validRepositoryName(personalProject);
        personalProjectRepository.save(personalProject);
        personalProject.createRepositoryPath(fixedPathHead);

        createRepository(personalProject);

        return PersonalProjectRepoCreateResponse.of(personalProject);
    }

    public List<PersonalProjectRepoReadResponse> readPersonalProject(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<PersonalProjectRepoReadResponse> results = personalProjectRepository.findAllByMaster(user)
                .stream().map(e -> PersonalProjectRepoReadResponse.of(e))
                .collect(Collectors.toList());

        return results;
    }

    private void createRepository(PersonalProject personalProject) {
        Path path = Paths.get(personalProject.getRepositoryPath());
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RepositoryCreationException(ErrorCode.REPOSITORY_CREATION_ERROR);
        }
    }

    // exception
    private void validRepositoryName(PersonalProject personalProject) {
        if (personalProjectRepository.existsByMasterAndName(personalProject.getMaster(), personalProject.getName())) {
            throw new DuplicatedRepositoryException(ErrorCode.REPOSITORY_NAME_DUPLICATED);
        }
    }
}
