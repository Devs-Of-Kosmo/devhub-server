package team.devs.devhub.domain.personalproject.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import team.devs.devhub.domain.personalproject.domain.repository.PersonalProjectRepository;
import team.devs.devhub.domain.personalproject.exception.DuplicatedRepositoryException;
import team.devs.devhub.domain.personalproject.exception.RepositoryCreationException;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectCreateRequest;
import team.devs.devhub.domain.personalproject.dto.PersonalProjectCreateResponse;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@Transactional
public class PersonalProjectService {

    private final UserRepository userRepository;
    private final PersonalProjectRepository personalProjectRepository;
    private final String fixedPathHead;

    public PersonalProjectService(
            UserRepository userRepository,
            PersonalProjectRepository personalProjectRepository,
            @Value("${repository.path.personal}") String fixedPathHead
    ) {
        this.userRepository = userRepository;
        this.personalProjectRepository = personalProjectRepository;
        this.fixedPathHead = fixedPathHead;
    }

    public PersonalProjectCreateResponse savePersonalProject(PersonalProjectCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        PersonalProject personalProject = request.toEntity(user);

        validRepositoryName(personalProject);
        personalProjectRepository.save(personalProject);
        personalProject.createRepositoryPath(fixedPathHead);

        createRepository(personalProject);

        return PersonalProjectCreateResponse.of(personalProject);
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
