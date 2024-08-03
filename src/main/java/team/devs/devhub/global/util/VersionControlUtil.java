package team.devs.devhub.global.util;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.ResetCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;
import team.devs.devhub.domain.personalproject.domain.PersonalCommit;
import team.devs.devhub.domain.personalproject.domain.PersonalProject;
import team.devs.devhub.domain.personalproject.exception.*;
import team.devs.devhub.domain.personalproject.exception.FileNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;

import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class VersionControlUtil {

    public static void createGitIgnoreFile(PersonalProject project) {
        File gitIgnoreFile = new File(project.getRepositoryPath(), ".gitignore");
        try (FileWriter writer = new FileWriter(gitIgnoreFile)) {
            writer.write(".DS_Store\n");
        } catch (IOException e) {
            throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public static RevCommit initializeProject(PersonalProject project, String commitMessage) {
        try {
            File dir = new File(project.getRepositoryPath());
            Git git = Git.init().setDirectory(dir).call();

            git.add().addFilepattern(".").call();
            RevCommit commit = git.commit().setMessage(commitMessage).call();
            git.close();
            return commit;
        } catch (GitAPIException e) {
            throw new ProjectSaveException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public static RevCommit saveWorkedProject(PersonalProject project, String commitMessage) {
        try {
            Git git = Git.open(new File(project.getRepositoryPath()));
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

    public static byte[] getFileDataFromCommit(PersonalCommit personalCommit, String filePath) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            Git git = Git.open(new File(personalCommit.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(personalCommit.getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit commit = revWalk.parseCommit(objectId);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(commit.getTree());
            treeWalk.setRecursive(true);
            treeWalk.setFilter(PathFilter.create(filePath));

            if (!treeWalk.next()) {
                throw new FileNotFoundException(ErrorCode.FILE_NOT_FOUND);
            }

            ObjectId blobId = treeWalk.getObjectId(0);
            repository.open(blobId).copyTo(outputStream);

            git.close();
        } catch (IOException e) {
            throw new FileSearchException(ErrorCode.FILE_SEARCH_ERROR);
        }

        return outputStream.toByteArray();
    }

    public static void resetCommitHistory(PersonalCommit personalCommit) {
        try {
            Git git = Git.open(new File(personalCommit.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(personalCommit.getParentCommit().getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit commit = revWalk.parseCommit(objectId);
            revWalk.dispose();

            git.reset()
                    .setMode(ResetCommand.ResetType.HARD)
                    .setRef(commit.getName())
                    .call();

            git.close();
        } catch (IOException | GitAPIException e) {
            throw new CommitResetException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    private VersionControlUtil() {}
}
