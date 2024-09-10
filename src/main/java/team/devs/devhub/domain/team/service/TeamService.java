package team.devs.devhub.domain.team.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import team.devs.devhub.domain.team.domain.team.Team;
import team.devs.devhub.domain.team.domain.team.TeamRole;
import team.devs.devhub.domain.team.domain.team.UserTeam;
import team.devs.devhub.domain.team.domain.team.repository.TeamRepository;
import team.devs.devhub.domain.team.domain.team.repository.UserTeamRepository;
import team.devs.devhub.domain.team.dto.team.*;
import team.devs.devhub.domain.team.exception.CannotKickManagerException;
import team.devs.devhub.domain.team.exception.TeamNotFoundException;
import team.devs.devhub.domain.team.exception.TeamRoleUnauthorizedException;
import team.devs.devhub.domain.team.exception.UserTeamNotFoundException;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.MailSendException;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.policy.MailPolicy;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class TeamService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserTeamRepository userTeamRepository;
    private final JavaMailSender javaMailSender;
    @Value("${spring.mail.verification.sender}")
    private String senderEmail;

    public TeamGroupCreateResponse saveTeamGroup(TeamGroupCreateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        Team prePersistTeam = request.toEntity(user);

        Team team = teamRepository.save(prePersistTeam);

        userTeamRepository.save(
                UserTeam.builder()
                .user(user)
                .team(team)
                .role(TeamRole.MANAGER)
                .build()
        );

        return TeamGroupCreateResponse.of(team);
    }

    @Transactional(readOnly = true)
    public List<TeamGroupReadResponse> readTeamGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));

        List<TeamGroupReadResponse> results = userTeamRepository.findAllByUserFetchJoinTeam(user).stream()
                .map(e -> TeamGroupReadResponse.of(e.getTeam()))
                .collect(Collectors.toList());

        return results;
    }

    @Transactional(readOnly = true)
    public TeamDetailsReadResponse readTeamDetails(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validExistsUserAndTeam(user, team);

        List<UserTeam> userTeamList = userTeamRepository.findAllByTeamFetchJoinUserAndTeam(team);

        return TeamDetailsReadResponse.of(userTeamList);
    }

    public TeamGroupUpdateResponse updateTeamInfo(TeamGroupUpdateRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        Team target = request.toEntity();

        team.update(target);

        return TeamGroupUpdateResponse.of(team);
    }

    public void deleteTeam(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validManagerOrHigher(userTeam);

        team.softDelete();
    }

    public void updateDeleteCancelTeam(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validManagerOrHigher(userTeam);

        team.cancelSoftDelete();
    }

    public void deleteAffiliatedUser(long teamId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validIsManager(userTeam);

        userTeamRepository.deleteByUserIdAndTeamId(user.getId(), team.getId());
    }

    public void deleteAffiliatedUserByKickOut(long teamId, long kickUserId, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        User kickUser = userRepository.findById(kickUserId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        UserTeam kickUserTeam = userTeamRepository.findByUserAndTeam(kickUser, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);
        validIfKickedMemberIsManager(kickUserTeam);

        userTeamRepository.deleteByUserIdAndTeamId(kickUser.getId(), team.getId());

        try {
            MimeMessage emailForm = createEmailForm(team, kickUser.getEmail());
            javaMailSender.send(emailForm);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new MailSendException(ErrorCode.MAIL_SEND_FAILURE);
        }
    }

    public TeamRolePromotionResponse updateAffiliatedUserRole(TeamRolePromotionRequest request, long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        User targetUser = userRepository.findById(request.getTargetUserId())
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        userTeamRepository.updateRoleByUserAndTeam(TeamRole.SUB_MANAGER, targetUser.getId(), team.getId());
        UserTeam targetUserTeam = userTeamRepository.findByUserAndTeam(targetUser, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));

        return TeamRolePromotionResponse.of(targetUserTeam);
    }

    private MimeMessage createEmailForm(Team team, String email) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject(MailPolicy.TEAM_KICK_TITLE);
        helper.setFrom(senderEmail, MailPolicy.DEFAULT_SENDER_NAME);
        helper.setText(setContext(team.getName()), true);

        return message;
    }

    private String setContext(String teamName) {
        Context context = new Context();
        TemplateEngine templateEngine = new TemplateEngine();
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();

        context.setVariable("teamName", teamName);

        templateResolver.setPrefix("templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCacheable(false);

        templateEngine.setTemplateResolver(templateResolver);

        return templateEngine.process("mailform/team-kick-mail", context);
    }

    // exception
    private void validExistsUserAndTeam(User user, Team team) {
        if (!userTeamRepository.existsByUserAndTeam(user, team)) {
            throw new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND);
        }
    }

    private void validManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_MANAGER_OR_HIGHER);
        }
    }

    private void validSubManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER
                || userTeam.getRole() == TeamRole.SUB_MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_SUB_MANAGER_OR_HIGHER);
        }
    }

    private void validIsManager(UserTeam userTeam) {
        if (userTeam.getRole() == TeamRole.MANAGER) {
            throw new TeamRoleUnauthorizedException(ErrorCode.MANAGER_ACTION_NOT_ALLOWED);
        }
    }

    private void validIfKickedMemberIsManager(UserTeam kickUserTeam) {
        if (kickUserTeam.getRole() == TeamRole.MANAGER) {
            throw new CannotKickManagerException(ErrorCode.CANNOT_KICK_MANAGER);
        }
    }
}
