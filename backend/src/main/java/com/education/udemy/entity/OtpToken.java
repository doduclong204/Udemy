package com.education.udemy.entity;

import com.education.udemy.enums.OtpPurpose;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "otp_tokens")
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String email;

    @Column(nullable = false, length = 6)
    String otp;

    @Column(nullable = false)
    LocalDateTime expiredAt;

    @Builder.Default
    Boolean used = false;

    @Builder.Default
    Integer attempts = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    OtpPurpose purpose;

    String tempPassword;
    String tempName;
    String tempPhone;
}