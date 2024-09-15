package team.devs.devhub.global.versioncontrol;

import lombok.RequiredArgsConstructor;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.MergeResult;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.revwalk.RevCommit;
import team.devs.devhub.domain.team.domain.project.TeamBranch;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.global.common.ProjectUtilProvider;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.versioncontrol.exception.VersionControlUtilException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
public class BranchUtil {
    private final GitUtil gitUtil;

    public Optional<Ref> getBranchByHeadCommit(ProjectUtilProvider project, RevCommit headCommit) {
        try (Git git = gitUtil.openRepository(project.getRepositoryPath())) {
            List<Ref> branches = git.branchList().call();
            for (Ref branch : branches) {
                if (branch.getObjectId().equals(headCommit)) {
                    return Optional.of(branch);
                }
            }
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_SEARCH_ERROR);
        }
        return null;
    }

    public void createBranch(TeamBranch branch) {
        try (Git git = gitUtil.openRepository(branch.getProject().getRepositoryPath())) {
            git.branchCreate()
                    .setName(branch.getName())
                    .setStartPoint(gitUtil.getCommit(git, branch.getFromCommit().getCommitCode()))
                    .call();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_CREATION_ERROR);
        }
    }

    public void deleteBranch(TeamBranch branch) {
        try (Git git = gitUtil.openRepository(branch.getProject().getRepositoryPath())) {
            gitUtil.checkoutDefaultBranch(git);
            git.branchDelete().setBranchNames(branch.getName()).setForce(true).call();
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.BRANCH_DELETE_ERROR);
        }
    }

    public RevCommit mergeToDefaultBranch(TeamBranch branch, User agent) {
        try (Git git = gitUtil.openRepository(branch.getProject().getRepositoryPath())) {
            gitUtil.checkoutDefaultBranch(git);

            MergeResult mergeResult = git.merge()
                    .include(gitUtil.getBranchRef(git, branch.getName()))
                    .call();

            return handleMergeResult(git, branch, agent, mergeResult);
        } catch (IOException | GitAPIException e) {
            throw new VersionControlUtilException(ErrorCode.MERGE_PROCESS_ERROR);
        }
    }

    private RevCommit handleMergeResult(Git git, TeamBranch branch, User agent, MergeResult mergeResult) throws GitAPIException, IOException {
        switch (mergeResult.getMergeStatus()) {
            case CONFLICTING:
                gitUtil.handleConflicts(git, branch, mergeResult);
                git.add().addFilepattern(".");
                return git.commit().setMessage(createMergeMessage(agent, branch) + " (충돌 파일 존재)").call();
            case FAST_FORWARD:
            case MERGED:
                return git.commit().setMessage(createMergeMessage(agent, branch)).call();
            case ALREADY_UP_TO_DATE:
                throw new VersionControlUtilException(ErrorCode.ALREADY_UP_TO_DATE);
            case ABORTED:
            case FAILED:
            case NOT_SUPPORTED:
            default:
                throw new VersionControlUtilException(ErrorCode.MERGE_FAILED_ERROR);
        }
    }

    private String createMergeMessage(User agent, TeamBranch branch) {
        return String.format("\"%s\"님이 \"%s\"님의 \"%s\" 브랜치를 병합했습니다.",
                agent.getName(), branch.getCreatedBy().getName(), branch.getName());
    }
}
