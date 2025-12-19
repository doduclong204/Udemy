package com.education.udemy.entity;


import java.time.Instant;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "settings")
@JsonPropertyOrder(alphabetic = true)
public class Setting extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    // --- Thông tin Website ---
    String siteName;
    @Column(columnDefinition = "TEXT")
    String siteDescription;
    String logo;
    String favicon;
    String primaryColor;

    // --- Thông tin liên hệ ---
    String contactEmail;
    String contactPhone;
    String contactAddress;

    // --- Mạng xã hội (Liệt kê chi tiết) ---
    String facebookLink;
    String youtubeLink;

    // --- Footer ---
    String footerText;
}