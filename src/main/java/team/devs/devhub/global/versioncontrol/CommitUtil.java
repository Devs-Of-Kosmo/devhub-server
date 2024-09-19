package team.devs.devhub.global.versioncontrol;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevTree;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;
import team.devs.devhub.domain.personal.domain.PersonalCommit;
import team.devs.devhub.domain.personal.exception.FileNotFoundException;
import team.devs.devhub.domain.team.domain.project.TeamCommit;
import team.devs.devhub.global.common.CommitUtilProvider;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.exception.VersionControlUtilException;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RequiredArgsConstructor
public class CommitUtil {
    private final GitUtil gitUtil;

    public List<String> getFileNameWithPathList(CommitUtilProvider commit) {
        List<String> filePaths = new ArrayList<>();
        try (
                Git git = gitUtil.openRepository(commit.getRepositoryPath());
                RevWalk revWalk = new RevWalk(git.getRepository());
                TreeWalk treeWalk = new TreeWalk(git.getRepository())
        ) {
            ObjectId commitId = git.getRepository().resolve(commit.getCommitCode());
            RevCommit revCommit = revWalk.parseCommit(commitId);

            RevTree revTree = revCommit.getTree();
            treeWalk.addTree(revTree);
            treeWalk.setRecursive(true);
            while (treeWalk.next()) {
                String path = treeWalk.getPathString();
                if (path.contains(".gitignore")) {
                    continue;
                }
                filePaths.add(path);
            }
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.FETCH_FILE_LIST_ERROR);
        }
        return filePaths;
    }

    public byte[] getFileDataFromCommit(CommitUtilProvider commit, String filePath) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (
                Git git = gitUtil.openRepository(commit.getRepositoryPath());
                Repository repository = git.getRepository()
        ) {
            ObjectId commitId = ObjectId.fromString(commit.getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit revCommit = revWalk.parseCommit(commitId);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(revCommit.getTree());
            treeWalk.setRecursive(true);
            treeWalk.setFilter(PathFilter.create(filePath));

            if (!treeWalk.next()) {
                throw new FileNotFoundException(ErrorCode.FILE_NOT_FOUND);
            }

            ObjectId blobId = treeWalk.getObjectId(0);
            repository.open(blobId).copyTo(outputStream);
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.FILE_SEARCH_ERROR);
        }
        return outputStream.toByteArray();
    }

    public byte[] createProjectFilesAsZip(CommitUtilProvider commit) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try (
                Git git = Git.open(new File(commit.getRepositoryPath()));
                Repository repository = git.getRepository()
        ) {
            ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream);

            ObjectId objectId = ObjectId.fromString(commit.getCommitCode());
            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(repository.parseCommit(objectId).getTree());
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                String path = treeWalk.getPathString();

                if (path.endsWith(".gitignore")) {
                    continue;
                }

                ObjectId walkObjectId = treeWalk.getObjectId(0);

                if (treeWalk.isSubtree()) {
                    zipOutputStream.putNextEntry(new ZipEntry(path + "/"));
                    zipOutputStream.closeEntry();
                } else {
                    zipOutputStream.putNextEntry(new ZipEntry(path));
                    InputStream inputStream = repository.open(walkObjectId).openStream();
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
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.ZIP_FILE_GENERATE_ERROR);
        }
        return byteArrayOutputStream.toByteArray();
    }

    public void resetCommitHistory(PersonalCommit commit) {
        try (Git git = gitUtil.openRepository(commit.getProject().getRepositoryPath())) {
            gitUtil.resetToCommit(git, commit.getParentCommit().getCommitCode());
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    public void resetCommitHistory(TeamCommit commit) {
        try (Git git = gitUtil.openRepository(commit.getBranch().getProject().getRepositoryPath())) {
            gitUtil.checkoutBranch(git, commit.getBranch().getName());
            gitUtil.resetToCommit(git, commit.getParentCommit().getCommitCode());
            gitUtil.checkoutDefaultBranch(git);
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }
}
