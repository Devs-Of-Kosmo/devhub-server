package team.devs.devhub.global.versioncontrol;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.revwalk.RevCommit;
import team.devs.devhub.domain.personal.domain.PersonalProject;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.team.dto.project.TeamProjectSaveRequest;
import team.devs.devhub.global.common.ProjectUtilProvider;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.exception.VersionControlUtilException;

import java.io.IOException;

@RequiredArgsConstructor
public class ProjectUtil {
    private final GitUtil gitUtil;

    public RevCommit initializeProject(ProjectUtilProvider project, String commitMessage) {
        try (Git git = gitUtil.initRepository(project.getRepositoryPath())) {
            git.add().addFilepattern(".").call();
            return git.commit().setMessage(commitMessage).call();
        } catch (GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public RevCommit saveWorkedProject(PersonalProject project, String commitMessage) {
        try (Git git = gitUtil.openRepository(project.getRepositoryPath())) {
            gitUtil.handleUntrackedFiles(git);
            git.add().addFilepattern(".").call();
            return git.commit().setMessage(commitMessage).call();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }

    public RevCommit saveWorkedProject(TeamBranch branch, TeamProjectSaveRequest dto) {
        Git git = null;
        try {
            git = gitUtil.openRepository(branch.getProject().getRepositoryPath());
            gitUtil.checkoutBranch(git, branch.getName());

            RepositoryUtil repositoryUtil = new RepositoryUtil(branch.getProject());
            repositoryUtil.deleteFiles(dto.getDeleteFileNameList());

            repositoryUtil.renameOrMoveFiles(git, dto.getRenameFileNameList());
            git.commit().setMessage("file move or rename commit").call();

            repositoryUtil.overwriteFiles(dto.getFiles(), git);

            for (String missing : git.status().call().getMissing()) {
                git.rm().addFilepattern(missing).call();
            }
            git.add().addFilepattern(".").call();
            RevCommit revCommit = git.commit().setMessage(dto.getCommitMessage()).call();

            gitUtil.checkoutDefaultBranch(git);
            git.close();
            return revCommit;
        } catch (Exception e) {
            gitUtil.rollbackChanges(git);
            throw new VersionControlUtilException(ErrorCode.PROJECT_SAVE_ERROR);
        }
    }
}
