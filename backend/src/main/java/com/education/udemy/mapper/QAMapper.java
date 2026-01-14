package com.education.udemy.mapper;

import com.education.udemy.dto.request.qa.QARequest;
import com.education.udemy.dto.response.qa.QAResponse;
import com.education.udemy.entity.CourseAnswer;
import com.education.udemy.entity.CourseQuestion;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QAMapper {

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "course", ignore = true)
    @Mapping(target = "lecture", ignore = true)
    CourseQuestion toQuestion(QARequest request);

    @Mapping(target = "user", ignore = true)
    @Mapping(target = "question", ignore = true)
    CourseAnswer toAnswer(QARequest request);

    @Mapping(target = "user.id", source = "user.id")
    @Mapping(target = "user.name", source = "user.name")
    @Mapping(target = "user.avatar", source = "user.avatar")
    QAResponse toQuestionResponse(CourseQuestion question);

    @Mapping(target = "user.id", source = "user.id")
    @Mapping(target = "user.name", source = "user.name")
    @Mapping(target = "user.avatar", source = "user.avatar")
    QAResponse toAnswerResponse(CourseAnswer answer);
}