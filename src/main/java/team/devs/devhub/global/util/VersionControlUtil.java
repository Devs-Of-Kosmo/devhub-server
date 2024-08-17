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
import team.devs.devhub.domain.personal.domain.PersonalCommit;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.personal.exception.*;
import team.devs.devhub.domain.personal.exception.FileNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.util.exception.VersionControlUtilException;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

public class VersionControlUtil {

    public static RevCommit initializeProject(ProjectUtilProvider project, String commitMessage) {
        try {
            File dir = new File(project.getRepositoryPath());
            Git git = Git.init().setDirectory(dir).call();

            git.add().addFilepattern(".").call();
            RevCommit commit = git.commit().setMessage(commitMessage).call();
            git.close();
            return commit;
        } catch (GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
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
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
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
            throw new VersionControlUtilException(ErrorCode.COMMIT_SEARCH_ERROR);
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
            throw new VersionControlUtilException(ErrorCode.FILE_SEARCH_ERROR);
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
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    public static byte[] generateProjectFilesAsZip(PersonalCommit personalCommit) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Git git = Git.open(new File(personalCommit.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId commit = ObjectId.fromString(personalCommit.getCommitCode());

            ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(repository.parseCommit(commit).getTree());
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                String path = treeWalk.getPathString();

                if (path.endsWith(".gitignore")) {
                    continue;
                }

                ObjectId objectId = treeWalk.getObjectId(0);

                if (treeWalk.isSubtree()) {
                    zipOutputStream.putNextEntry(new ZipEntry(path + "/"));
                    zipOutputStream.closeEntry();
                } else {
                    zipOutputStream.putNextEntry(new ZipEntry(path));
                    InputStream inputStream = repository.open(objectId).openStream();
                    byte[] buffer = new byte[1024];
                    int length = inputStream.read(buffer);
                    while (length != -1) {
                        zipOutputStream.write(buffer, 0, length);
                        length = inputStream.read(buffer);
                    }
                    zipOutputStream.closeEntry();
                }
            }

            zipOutputStream.close();
            git.close();
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.ZIP_FILE_GENERATE_ERROR);
        }
        return byteArrayOutputStream.toByteArray();
    }

    private VersionControlUtil() {}
}
