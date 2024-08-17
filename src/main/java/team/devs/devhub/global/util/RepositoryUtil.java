package team.devs.devhub.global.util;

import org.springframework.web.multipart.MultipartFile;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.global.common.ProjectUtilProvider;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.exception.RepositoryUtilException;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.List;

public class RepositoryUtil {

    public static void createRepository(ProjectUtilProvider project) {
        Path path = Paths.get(project.getRepositoryPath());
        try {
            Files.createDirectories(path);
        } catch (IOException e) {
            throw new RepositoryUtilException(ErrorCode.REPOSITORY_CREATION_ERROR);
        }
    }

    public static void changeRepositoryName(String oldRepoNamePath, ProjectUtilProvider project) {
        File oldDirectory = new File(oldRepoNamePath);
        File newDirectory = new File(project.getRepositoryPath());

        if (!oldDirectory.renameTo(newDirectory)) {
            throw new RepositoryUtilException(ErrorCode.REPOSITORY_UPDATE_ERROR);
        }
    }

    public static void deleteRepository(PersonalProject project) {
        Path path = Paths.get(project.getRepositoryPath());
        try {
            Files.walkFileTree(path, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                    Files.delete(file);
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                    Files.delete(dir);
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            throw new RepositoryUtilException(ErrorCode.REPOSITORY_DELETE_ERROR);
        }
    }

    public static void saveProjectFiles(PersonalProject project, List<MultipartFile> files) {
        for (MultipartFile file : files) {
            try {
                String relativePath = file.getOriginalFilename();
                Path filePath = Paths.get(project.getRepositoryPath(), relativePath);
                Files.createDirectories(filePath.getParent());
                Files.write(filePath, file.getBytes());
            } catch (IOException e) {
                throw new RepositoryUtilException(ErrorCode.PROJECT_SAVE_ERROR);
            }
        }
    }

    public static void deleteFileForCommit(PersonalProject project) {
        Path path = Paths.get(project.getRepositoryPath());
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
            throw new RepositoryUtilException(ErrorCode.DIRECTORY_DELETE_ERROR);
        }
    }

    private RepositoryUtil() {}
}
