package team.devs.devhub.domain.team.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import net.minidev.json.JSONObject;
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
import team.devs.devhub.domain.team.dto.invite.TeamInviteRequest;
import team.devs.devhub.domain.team.dto.invite.TeamInviteResponse;
import team.devs.devhub.domain.team.dto.invite.TeamJoinRequest;
import team.devs.devhub.domain.team.dto.invite.TeamJoinResponse;
import team.devs.devhub.domain.team.exception.*;
import team.devs.devhub.domain.user.domain.User;
import team.devs.devhub.domain.user.domain.repository.UserRepository;
import team.devs.devhub.domain.user.exception.MailSendException;
import team.devs.devhub.domain.user.exception.UserNotFoundException;
import team.devs.devhub.global.common.AsyncMailSendService;
import team.devs.devhub.global.error.exception.BusinessException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.policy.MailPolicy;
import team.devs.devhub.global.policy.RedisPolicy;
import team.devs.devhub.global.redis.RedisUtil;
import team.devs.devhub.global.util.TeamInviteCodeUtil;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
@RequiredArgsConstructor
public class InviteService {
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final UserTeamRepository userTeamRepository;
    private final AsyncMailSendService asyncMailSendService;
    private final JavaMailSender javaMailSender;
    private final RedisUtil redisUtil;
    private final TeamInviteCodeUtil teamInviteCodeUtil;
    private static final String INVITE_TEAM_INFO = "teamId";
    private static final String INVITE_USER_INFO = "invitedUserEmail";
    private static final String ENCODED_CODE_KEY = "code";


    public TeamInviteResponse sendInviteMail(TeamInviteRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(request.getInviteTeamId())
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        UserTeam userTeam = userTeamRepository.findByUserAndTeam(user, team)
                .orElseThrow(() -> new UserTeamNotFoundException(ErrorCode.USER_TEAM_NOT_FOUND));
        validSubManagerOrHigher(userTeam);

        String invitedEmail = request.getToEmail();
        validEmailExists(invitedEmail);
        validEmailInTeam(team, invitedEmail);

        JSONObject inviteData = new JSONObject();
        inviteData.put(INVITE_TEAM_INFO, team.getId());
        inviteData.put(INVITE_USER_INFO, invitedEmail);
        String inviteInfo = inviteData.toString();
        String encodedCode = teamInviteCodeUtil.encrypt(inviteInfo);
        validInviteMailExists(encodedCode);

        Map<String, String> data = new HashMap<>();
        String redirectPath = "/api/invite/join";
        data.put(ENCODED_CODE_KEY, encodedCode);
        data.put("redirectPath", redirectPath);

        try {
            MimeMessage emailForm = createEmailForm(team, user, invitedEmail, data);
            asyncMailSendService.send(emailForm);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new MailSendException(ErrorCode.MAIL_SEND_FAILURE);
        }

        return TeamInviteResponse.of(invitedEmail, encodedCode);
    }

    public TeamJoinResponse saveUserToTeam(TeamJoinRequest request, long userId) {
        Map<String, Object> map;
        try {
            map = new ObjectMapper().readValue(teamInviteCodeUtil.decrypt(request.getCode()), Map.class);
        } catch (JsonProcessingException e) {
            throw new BusinessException(ErrorCode.DESERIALIZE_ERROR);
        }
        long teamId = ((Number) map.get(INVITE_TEAM_INFO)).longValue();
        String invitedEmail = (String) map.get(INVITE_USER_INFO);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(ErrorCode.USER_NOT_FOUND));
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new TeamNotFoundException(ErrorCode.TEAM_NOT_FOUND));
        validInviteEmailMatch(user, invitedEmail);
        validEmailInTeam(team, invitedEmail);
        validInviteMailExpired(request.getCode());

        UserTeam userTeam = userTeamRepository.save(
                UserTeam.builder()
                        .user(user)
                        .team(team)
                        .role(TeamRole.MEMBER)
                        .build()
        );

        return TeamJoinResponse.of(userTeam);
    }

    private MimeMessage createEmailForm(Team team, User sender, String email, Map<String, String> data) throws MessagingException, UnsupportedEncodingException {
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

        helper.setTo(email);
        helper.setSubject(String.format(MailPolicy.TEAM_INVITE_TITLE, team.getName()));
        helper.setFrom(sender.getEmail(), sender.getName());
        helper.setText(setContext(data), true);

        redisUtil.setDataExpire(RedisPolicy.TEAM_INVITE_KEY + data.get(ENCODED_CODE_KEY), "invited", RedisPolicy.TEAM_INVITE_TTL);

        return message;
    }

    private String setContext(Map<String, String> data) {
        Context context = new Context();
        TemplateEngine templateEngine = new TemplateEngine();
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();

        for (String key : data.keySet()) {
            setContextVariable(context, key, data.get(key));
        }

        templateResolver.setPrefix("templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCacheable(false);

        templateEngine.setTemplateResolver(templateResolver);

        return templateEngine.process("mailform/team-invitation-mail", context);
    }

    private void setContextVariable(Context context, String name, String value) {
        context.setVariable(name, value);
    }

    // exception
    private void validSubManagerOrHigher(UserTeam userTeam) {
        if (!(userTeam.getRole() == TeamRole.MANAGER
                || userTeam.getRole() == TeamRole.SUB_MANAGER)) {
            throw new TeamRoleUnauthorizedException(ErrorCode.NOT_SUB_MANAGER_OR_HIGHER);
        }
    }

    private void validEmailExists(String email) {
        if (!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException(ErrorCode.USER_NOT_FOUND);
        }
    }

    private void validEmailInTeam(Team team, String email) {
        if (userTeamRepository.existsEmailByTeamJoinUser(team, email)) {
            throw new UserAlreadyInTeamException(ErrorCode.USER_ALREADY_IN_TEAM);
        }
    }

    private void validInviteMailExists(String code) {
        if (redisUtil.existData(RedisPolicy.TEAM_INVITE_KEY + code)) {
            throw new InviteMailAlreadyExistsException(ErrorCode.INVITE_MAIL_ALREADY_EXISTS);
        }
    }

    private void validInviteEmailMatch(User user, String invitedEmail) {
        if (!user.getEmail().equals(invitedEmail)) {
            throw new InviteEmailMismatchException(ErrorCode.INVITE_EMAIL_MISMATCH);
        }
    }

    private void validInviteMailExpired(String code) {
        if (!redisUtil.existData(RedisPolicy.TEAM_INVITE_KEY + code)) {
            throw new InviteMailExpiredException(ErrorCode.INVITE_MAIL_EXPIRED);
        }
    }
}
