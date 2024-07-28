package team.devs.devhub.global.util;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.revwalk.RevCommit;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.ProjectSaveException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class VersionControlUtil {

    public static void createGitIgnoreFile(PersonalProject personalProject) {
        File gitIgnoreFile = new File(personalProject.getRepositoryPath(), ".gitignore");
        try (FileWriter writer = new FileWriter(gitIgnoreFile)) {
            writer.write(".DS_Store\n");
        } catch (IOException e) {
            throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public static RevCommit initializeProject(PersonalProject personalProject, String commitMessage) {
        try {
            File dir = new File(personalProject.getRepositoryPath());
            Git git = Git.init().setDirectory(dir).call();

            git.add().addFilepattern(".").call();
            RevCommit commit = git.commit().setMessage(commitMessage).call();
            git.close();
            return commit;
        } catch (GitAPIException e) {
            throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    private VersionControlUtil() {}
}
