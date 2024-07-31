package team.devs.devhub.global.util;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.CommitSearchException;
import team.devs.devhub.domain.personalproject.exception.ProjectSaveException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

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

    public static RevCommit saveWorkedProject(PersonalProject personalProject, String commitMessage) {
        try {
            Git git = Git.open(new File(personalProject.getRepositoryPath()));
            Status status = git.status().call();

            git.add().addFilepattern(".").call();
            for (String missing : status.getMissing()) {
                git.rm().addFilepattern(missing).call();
            }
            RevCommit commit = git.commit().setMessage(commitMessage).call();
            git.close();
            return commit;
        } catch (IOException | GitAPIException e) {
            throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public static List<String> getFileNameWithPathList(PersonalCommit personalCommit) {
        List<String> fileNameWithPathList = new ArrayList<>();
        try {
            Git git = Git.open(new File(personalCommit.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(personalCommit.getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit commit = revWalk.parseCommit(objectId);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(commit.getTree());
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                String path = treeWalk.getPathString();
                if (path.contains(".gitignore")) {
                    continue;
                }
                fileNameWithPathList.add(path);
            }

            git.close();
        } catch (Exception e) {
            throw new CommitSearchException(ErrorCode.COMMIT_SEARCH_ERROR);
        }

        return fileNameWithPathList;
    }

    private VersionControlUtil() {}
}
