package team.devs.devhub.global.util;

import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.ProjectSaveException;
import team.devs.devhub.domain.personalproject.exception.RepositoryCreationException;
import team.devs.devhub.domain.personalproject.exception.DirectoryDeleteException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
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

    public static void deleteDirectory(PersonalProject personalProject){
        Path path = Paths.get(personalProject.getRepositoryPath());
        try {
            Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    // .git 디렉토리와 .gitignore 파일은 삭제하지 않음
                    if (!file.getFileName().toString().equals(".gitignore") && !isUnderGitDirectory(file)) {
                        Files.delete(file);
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    // .git 디렉토리는 삭제하지 않음
                    if (!dir.getFileName().toString().equals(".git") && !isUnderGitDirectory(dir) && !Files.list(dir).findAny().isPresent()) {
                        Files.delete(dir);
                    }
                    return FileVisitResult.CONTINUE;
                }

                private boolean isUnderGitDirectory(Path path) {
                    // .git 디렉토리 하위에 있는지 확인
                    for (Path part : path) {
                        if (part.toString().equals(".git")) {
                            return true;
                        }
                    }
                    return false;
                }
            });
        } catch (IOException e) {
            throw new DirectoryDeleteException(ErrorCode.DIRECTORY_DELETE_ERROR);
        }
    }

    private RepositoryUtil() {}
}
