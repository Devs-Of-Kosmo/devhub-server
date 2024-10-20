package team.devs.devhub.global.versioncontrol;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.ResetCommand;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.RefNotFoundException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectLoader;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.springframework.stereotype.Component;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.exception.VersionControlUtilException;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

@Component
public class GitUtil {

    public Git openRepository(String path) throws IOException {
        return Git.open(new File(path));
    }

    public Git initRepository(String path) throws GitAPIException {
        return Git.init().setDirectory(new File(path)).call();
    }

    public void checkoutBranch(Git git, String branchName) throws GitAPIException {
        git.checkout().setName(branchName).call();
    }

    public void checkoutDefaultBranch(Git git) throws GitAPIException {
        try {
            git.checkout().setName("master").call();
        } catch (RefNotFoundException e) {
            git.checkout().setName("main").call();
        }
    }

    public Ref getBranchRef(Git git, String branchName) throws IOException {
        return git.getRepository().exactRef("refs/heads/" + branchName);
    }

    public RevCommit getCommit(Git git, String commitHash) throws IOException {
        return new RevWalk(git.getRepository()).parseCommit(ObjectId.fromString(commitHash));
    }

    public void handleConflicts(Git git, TeamBranch branch, MergeResult mergeResult) throws IOException, GitAPIException {
        for (String filePath : mergeResult.getConflicts().keySet()) {
            overwriteFileFromBranch(git, branch.getName(), filePath);
        }
        git.add().addFilepattern(".").call();
    }

    private void overwriteFileFromBranch(Git git, String branchName, String filePath) throws IOException{
        ObjectId branchTree = git.getRepository().resolve(branchName + "^{tree}");

        try (TreeWalk treeWalk = new TreeWalk(git.getRepository())) {
            treeWalk.addTree(branchTree);
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                if (treeWalk.getPathString().equals(filePath)) {
                    ObjectId blobId = treeWalk.getObjectId(0);
                    writeToWorkingDirectory(git, filePath, blobId);
                    break;
                }
            }
        }
    }

    private void writeToWorkingDirectory(Git git, String filePath, ObjectId blobId) throws IOException {
        File file = new File(git.getRepository().getWorkTree(), filePath);
        try (OutputStream outputStream = new FileOutputStream(file)) {
            ObjectLoader loader = git.getRepository().open(blobId);
            outputStream.write(loader.getBytes());
        }
    }

    public void resetToCommit(Git git, String commitHash) throws GitAPIException {
        git.reset().setMode(ResetCommand.ResetType.HARD).setRef(commitHash).call();
    }

    public void handleUntrackedFiles(Git git) throws GitAPIException {
        for (String missing : git.status().call().getMissing()) {
            git.rm().addFilepattern(missing).call();
        }
    }

    public void rollbackChanges(Git git) {
        try {
            ObjectId stashId = git.stashCreate().call();
            if (stashId != null) {
                git.stashDrop().setStashRef(0).call();
            }
            git.close();
        } catch (GitAPIException e) {
            git.close();
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    public static void resetToBeforeCommit(Git git) {
        try {
            git.reset()
                    .setMode(ResetCommand.ResetType.HARD)
                    .setRef("HEAD^")
                    .call();
            git.close();
        } catch (GitAPIException e) {
            git.close();
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

}
