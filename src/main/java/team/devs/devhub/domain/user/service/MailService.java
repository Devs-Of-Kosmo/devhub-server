package team.devs.devhub.domain.user.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import team.devs.devhub.domain.user.dto.EmailAuthenticationResponse;
import team.devs.devhub.domain.user.dto.MailSendResponse;
import team.devs.devhub.domain.user.exception.AuthenticationCodeException;
import team.devs.devhub.domain.user.exception.MailSendException;
import team.devs.devhub.global.error.exception.ErrorCode;
import team.devs.devhub.global.policy.MailPolicy;
import team.devs.devhub.global.policy.RedisPolicy;
import team.devs.devhub.global.redis.RedisUtil;
import team.devs.devhub.global.util.EmailVeificationCodeUtil;

import java.io.UnsupportedEncodingException;

@Service
@RequiredArgsConstructor
public class MailService {
    private final JavaMailSender javaMailSender;
    private final RedisUtil redisUtil;
    @Value("${spring.mail.verification.sender}")
    private String senderEmail;

    public MailSendResponse sendEmail(String toEmail){
        if (redisUtil.existData(RedisPolicy.MAIL_AUTH_KEY + toEmail)) {
            redisUtil.deleteData(RedisPolicy.MAIL_AUTH_KEY + toEmail);
        }

        try {
            MimeMessage emailForm = createEmailForm(toEmail);
            javaMailSender.send(emailForm);
        } catch (MessagingException | UnsupportedEncodingException e) {
            throw new MailSendException(ErrorCode.MAIL_SEND_FAILURE);
        }

        return MailSendResponse.of(toEmail);
    }

    public EmailAuthenticationResponse checkEmailCode(String toEmail, String requestCode) {
        String savedCode = redisUtil.getData(RedisPolicy.MAIL_AUTH_KEY + toEmail);

        verifyExistAuthenticationCode(savedCode);
        verifyMatchedAuthenticationCode(savedCode, requestCode);

        return EmailAuthenticationResponse.of(Boolean.TRUE);
    }

    private MimeMessage createEmailForm(String email) throws MessagingException, UnsupportedEncodingException {
        String authCode = EmailVeificationCodeUtil.createCode();

        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(email);
        helper.setSubject(MailPolicy.MAIL_AUTH_TITLE);
        helper.setFrom(senderEmail, MailPolicy.MAIL_AUTH_SENDER_NAME);
        helper.setText(setContext(authCode), true);

        redisUtil.setDataExpire(RedisPolicy.MAIL_AUTH_KEY + email, authCode, RedisPolicy.MAIL_AUTH_TTL);

        return message;
    }

    private String setContext(String code) {
        Context context = new Context();
        TemplateEngine templateEngine = new TemplateEngine();
        ClassLoaderTemplateResolver templateResolver = new ClassLoaderTemplateResolver();

        context.setVariable("code", code);

        templateResolver.setPrefix("templates/");
        templateResolver.setSuffix(".html");
        templateResolver.setTemplateMode(TemplateMode.HTML);
        templateResolver.setCacheable(false);

        templateEngine.setTemplateResolver(templateResolver);

        return templateEngine.process("mailform/mail", context);
    }

    private void verifyExistAuthenticationCode(String savedCode) {
        if (savedCode == null) {
            throw new AuthenticationCodeException(ErrorCode.AUTHENTICATION_CODE_NOT_EXIST);
        }
    }

    private void verifyMatchedAuthenticationCode(String savedCode, String requestCode) {
        if (!savedCode.equals(requestCode)) {
            throw new AuthenticationCodeException(ErrorCode.AUTHENTICATION_CODE_NOT_MATCHED);
        }
    }

}
