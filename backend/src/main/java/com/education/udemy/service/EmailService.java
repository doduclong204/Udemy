package com.education.udemy.service;

import com.education.udemy.enums.OtpPurpose;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp, OtpPurpose purpose) {
        String subject = purpose == OtpPurpose.REGISTER
                ? "Verify your registration"
                : "Reset your password";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(buildOtpEmailHtml(otp, purpose), true);

            mailSender.send(message);
            log.info("OTP email sent to {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Cannot send OTP email");
        }
    }

    private String buildOtpEmailHtml(String otp, OtpPurpose purpose) {
        String action = purpose == OtpPurpose.REGISTER
                ? "register your account"
                : "reset your password";
        return """
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
                    <h2 style="color: #4F46E5;">Your verification code</h2>
                    <p>You requested to %s. Use the OTP code below:</p>
                    <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px;">
                        <h1 style="letter-spacing: 8px; color: #1f2937; font-size: 36px;">%s</h1>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        This code is valid for <b>5 minutes</b>. Do not share it with anyone.
                    </p>
                </div>
                """.formatted(action, otp);
    }
}