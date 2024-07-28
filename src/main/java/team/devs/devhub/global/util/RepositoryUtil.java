package team.devs.devhub.global.util;

import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.ProjectSaveException;
import team.devs.devhub.domain.personalproject.exception.RepositoryCreationException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

public class RepositoryUtil {

    public static void createRepository(PersonalProject personalProject) {
        Path path = Paths.get(personalProject.getRepositoryPath());
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RepositoryCreationException(ErrorCode.REPOSITORY_CREATION_ERROR);
        }
    }

    public static void saveProjectFiles(String repositoryPath, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            try {
                String relativePath = file.getOriginalFilename();
                Path filePath = Paths.get(repositoryPath, relativePath);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, file.getBytes());
            } catch (IOException e) {
                throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
            }
        }
    }

    private RepositoryUtil() {}
}
