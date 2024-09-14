package team.devs.devhub.global.versioncontrol;

import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.ResetCommand;
import org.eclipse.jgit.api.Status;
import org.eclipse.jgit.api.errors.*;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.ObjectLoader;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.revwalk.RevCommit;
import org.eclipse.jgit.revwalk.RevWalk;
import org.eclipse.jgit.treewalk.TreeWalk;
import org.eclipse.jgit.treewalk.filter.PathFilter;
import team.devs.devhub.domain.personal.domain.PersonalCommit;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.personal.exception.FileNotFoundException;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.domain.project.TeamCommit;
import team.devs.devhub.domain.team.domain.project.TeamProject;
import team.devs.devhub.domain.team.dto.project.TeamProjectSaveRequest;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.CommitUtilProvider;
import team.devs.devhub.global.common.ProjectUtilProvider;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.exception.VersionControlUtilException;

import java.io.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    public static void createBranch(TeamBranch branch) {
        try {
            Git git = Git.open(new File(branch.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            String fromCommitHash = branch.getFromCommit().getCommitCode();
            String newBranchName = branch.getName();

            RevWalk walk = new RevWalk(repository);
            RevCommit fromCommit = walk.parseCommit(repository.resolve(fromCommitHash));

            git.branchCreate()
                    .setName(newBranchName)
                    .setStartPoint(fromCommit)
                    .call();

            git.close();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_CREATION_ERROR);
        }
    }

    public static Optional<Ref> getBranch(ProjectUtilProvider project, RevCommit commit) {
        try (Git git = Git.open(new File(project.getRepositoryPath()))) {
            List<Ref> branches = git.branchList().call();
            for (Ref branch : branches) {
                if (isCommitInBranch(git, commit, branch)) {
                    return Optional.of(branch);
                }
            }
            return null;
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_SEARCH_ERROR);
        }
    }

    private static boolean isCommitInBranch(Git git, RevCommit commit, Ref branch) throws IOException, GitAPIException {
        Iterable<RevCommit> commits = git.log().add(git.getRepository().resolve(branch.getName())).call();
        for (RevCommit revCommit : commits) {
            if (revCommit.equals(commit)) {
                return true;
            }
        }
        return false;
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

    public static RevCommit saveWorkedProject(TeamBranch branch, TeamProjectSaveRequest dto) {
        TeamProject project = branch.getProject();
        Git git = null;
        try {
            git = Git.open(new File(project.getRepositoryPath()));

            checkoutWorkingBranch(git, branch);

            RepositoryUtil repositoryUtil = new RepositoryUtil(project);
            repositoryUtil.deleteFiles(project, dto.getDeleteFileNameList());
            renameOrMoveFiles(project, dto.getRenameFileNameList());
            repositoryUtil.overwriteFiles(dto.getFiles(), git);

            Status status = git.status().call();
            for (String missing : status.getMissing()) {
                git.rm().addFilepattern(missing).call();
            }

            git.add()
                    .addFilepattern(".")
                    .call();

            RevCommit commit = git.commit().setMessage(dto.getCommitMessage()).call();

            checkoutDefaultBranch(git);

            git.close();
            return commit;
        } catch (Exception e) {
            rollbackToBeforeChange(git);
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public static void deleteBranch(TeamBranch branch) {
        try {
            Git git = Git.open(new File(branch.getProject().getRepositoryPath()));

            checkoutDefaultBranch(git);

            git.branchDelete()
                    .setBranchNames(branch.getName())
                    .setForce(true)
                    .call();

            git.close();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_DELETE_ERROR);
        }
    }

    public static List<String> getFileNameWithPathList(CommitUtilProvider commit) {
        List<String> fileNameWithPathList = new ArrayList<>();
        try {
            Git git = Git.open(new File(commit.getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(commit.getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit revCommit = revWalk.parseCommit(objectId);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(revCommit.getTree());
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                String path = treeWalk.getPathString();
                if (path.contains(".gitignore")) {
                    continue;
                }
                fileNameWithPathList.add(path);
            }

            git.close();
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.COMMIT_SEARCH_ERROR);
        }

        return fileNameWithPathList;
    }

    public static byte[] getFileDataFromCommit(CommitUtilProvider commit, String filePath) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try {
            Git git = Git.open(new File(commit.getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(commit.getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit revCommit = revWalk.parseCommit(objectId);

            TreeWalk treeWalk = new TreeWalk(repository);
            treeWalk.addTree(revCommit.getTree());
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

    public static void resetCommitHistory(PersonalCommit commit) {
        try {
            Git git = Git.open(new File(commit.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(commit.getParentCommit().getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit revCommit = revWalk.parseCommit(objectId);
            revWalk.dispose();

            git.reset()
                    .setMode(ResetCommand.ResetType.HARD)
                    .setRef(revCommit.getName())
                    .call();

            git.close();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    public static void resetCommitHistory(TeamCommit commit) {
        TeamBranch branch = commit.getBranch();
        try {
            Git git = Git.open(new File(branch.getProject().getRepositoryPath()));
            Repository repository = git.getRepository();

            checkoutWorkingBranch(git, branch);

            ObjectId objectId = ObjectId.fromString(commit.getParentCommit().getCommitCode());

            RevWalk revWalk = new RevWalk(repository);
            RevCommit revCommit = revWalk.parseCommit(objectId);
            revWalk.dispose();

            git.reset()
                    .setMode(ResetCommand.ResetType.HARD)
                    .setRef(revCommit.getName())
                    .call();

            checkoutDefaultBranch(git);

            git.close();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.COMMIT_RESET_ERROR);
        }
    }

    public static RevCommit mergeToDefaultBranch(TeamBranch branch, User agent) {
        try {
            Git git = Git.open(new File(branch.getProject().getRepositoryPath()));

            checkoutDefaultBranch(git);

            Ref featureBranchRef = git.getRepository().exactRef("refs/heads/" + branch.getName());

            MergeResult mergeResult = git.merge()
                    .include(featureBranchRef)
                    .call();

            RevCommit commit;
            switch (mergeResult.getMergeStatus()) {
                case CONFLICTING:
                    handleConflicts(git, branch, mergeResult);
                    commit = createCommitWhenConflict(git, agent, branch);
                    break;

                case FAST_FORWARD:
                case MERGED:
                    commit = createCommit(git, agent, branch);
                    break;

                case ALREADY_UP_TO_DATE:
                    throw new VersionControlUtilException(ErrorCode.ALREADY_UP_TO_DATE);

                case ABORTED:
                case FAILED:
                case NOT_SUPPORTED:
                default:
                    throw new VersionControlUtilException(ErrorCode.MERGE_FAILED_ERROR);
            }

            git.close();
            return commit;
        } catch (IOException | GitAPIException e) {
            e.printStackTrace();
            throw new VersionControlUtilException(ErrorCode.MERGE_PROCESS_ERROR);
        }
    }

    private static RevCommit createCommitWhenConflict(Git git, User agent, TeamBranch branch) throws GitAPIException {
        return git.commit()
                .setMessage(createCommitMessage(agent, branch) + " (충돌 파일 존재)")
                .call();
    }

    private static RevCommit createCommit(Git git, User agent, TeamBranch branch) throws GitAPIException {
        return git.commit()
                .setMessage(createCommitMessage(agent, branch))
                .call();
    }

    private static String createCommitMessage(User agent, TeamBranch branch) {
        return "\"" + agent.getName() + "\"님께서 \"" + branch.getCreatedBy().getName() + "\"님의 \""
                + branch.getName() + "\" 브랜치를 병합 하셨습니다.";
    }

    private static void handleConflicts(Git git, TeamBranch branch, MergeResult mergeResult) throws GitAPIException, IOException {
        for (String conflictFilePath : mergeResult.getConflicts().keySet()) {
            overwriteWithFeatureBranch(git, branch.getName(), conflictFilePath);
        }
        git.add().addFilepattern(".").call();
    }

    private static void overwriteWithFeatureBranch(Git git, String featureBranchName, String conflictFilePath) throws IOException, GitAPIException {
        ObjectId featureBranchTreeId = git.getRepository().resolve(featureBranchName + "^{tree}");

        try (TreeWalk treeWalk = new TreeWalk(git.getRepository())) {
            treeWalk.addTree(featureBranchTreeId);
            treeWalk.setRecursive(true);

            while (treeWalk.next()) {
                if (treeWalk.getPathString().equals(conflictFilePath)) {
                    ObjectId objectId = treeWalk.getObjectId(0);

                    File file = new File(git.getRepository().getWorkTree(), conflictFilePath);
                    try (OutputStream outputStream = new FileOutputStream(file)) {
                        ObjectLoader loader = git.getRepository().open(objectId);
                        outputStream.write(loader.getBytes());
                    }

                    git.add().addFilepattern(conflictFilePath).call();
                    break;
                }
            }
        }
    }

    public static byte[] generateProjectFilesAsZip(CommitUtilProvider commit) {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        try {
            Git git = Git.open(new File(commit.getRepositoryPath()));
            Repository repository = git.getRepository();

            ObjectId objectId = ObjectId.fromString(commit.getCommitCode());

            ZipOutputStream zipOutputStream = new ZipOutputStream(byteArrayOutputStream);

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
            git.close();
        } catch (IOException e) {
            throw new VersionControlUtilException(ErrorCode.ZIP_FILE_GENERATE_ERROR);
        }
        return byteArrayOutputStream.toByteArray();
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

    private static void renameOrMoveFiles(TeamProject project, List<List<String>> filePaths) throws IOException, GitAPIException {
        String repositoryPath = project.getRepositoryPath();

        Git git = Git.open(new File(repositoryPath));

        for (List<String> e : filePaths) {

            String fromName = e.get(0);
            String toName = e.get(1);

            File from = new File(repositoryPath, fromName);
            File to = new File(repositoryPath, toName);

            to.getParentFile().mkdirs();

            boolean success = from.renameTo(to);
            if (success) {
                git.rm().addFilepattern(fromName).call();
                git.add().addFilepattern(toName).call();
            }
        }

        git.commit()
                .setMessage("move or rename file commit")
                .call();

        git.close();
    }

    private static void checkoutWorkingBranch(Git git, TeamBranch branch) throws GitAPIException {
        git.checkout()
                .setName(branch.getName())
                .call();
    }

    private static void checkoutDefaultBranch(Git git) throws GitAPIException {
        try {
            git.checkout().setName("master").call();
        } catch (Exception e) {
            git.checkout().setName("main").call();
        }
    }

    private static void rollbackToBeforeChange(Git git) {
        try {
            ObjectId stashId = git.stashCreate().call();
            if (stashId != null) {
                git.stashDrop().setStashRef(0).call();
            }
            git.close();
        } catch (Exception e) {
            git.close();
            throw new VersionControlUtilException(ErrorCode.GIT_ROLLBACK_ERROR);
        }
    }

    private VersionControlUtil() {}
}