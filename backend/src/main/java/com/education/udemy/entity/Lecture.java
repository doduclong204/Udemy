package com.education.udemy.entity;

import java.util.List;
import com.education.udemy.enums.LectureType;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "lectures")
@JsonPropertyOrder(alphabetic = true)
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, length = 255)
    String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    LectureType type;

    @Column(length = 500)
    String videoUrl;

    @Column(columnDefinition = "TEXT")
    String content;

    @Builder.Default
    Integer duration = 0;

    @Builder.Default
    Boolean isFree = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    Section section;

    @OneToMany(mappedBy = "lecture")
    List<LectureProgress> lectureProgresses;
}