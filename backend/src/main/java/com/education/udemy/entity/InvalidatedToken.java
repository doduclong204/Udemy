package com.education.udemy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import lombok.*;
import lombok.experimental.FieldDefaults;
import jakarta.persistence.Id;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class InvalidatedToken {
    @Id
    @Column(name = "access_token", length = 512, nullable = false)
    String accessToken;
}
