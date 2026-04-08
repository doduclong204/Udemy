package com.education.udemy.entity;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Formula;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity(name = "categories")
@JsonPropertyOrder(alphabetic = true)
public class Category extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JsonProperty("_id")
    String id;

    @Column(nullable = false, length = 100)
    String name;

    @Column(nullable = false, unique = true, length = 100)
    String slug;

    @Column(length = 500)
    String icon;

    @Column(columnDefinition = "TEXT")
    String description;

    @Formula("(SELECT COUNT(*) FROM courses c WHERE c.category_id = id)")
    Integer totalCourses;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @JsonIgnore
    List<Course> courses;
}