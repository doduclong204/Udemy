package com.education.udemy.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.entity.User;


@Mapper(componentModel = "spring")
public interface AuthMapper {
    @Mapping(target = "role", ignore = true)
    User toUser(UserCreationRequest request);

    UserResponse toUserResponse(User user);
}
