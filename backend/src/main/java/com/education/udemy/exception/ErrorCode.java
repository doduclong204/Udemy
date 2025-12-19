package com.education.udemy.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    // AUTHENTICATION
    UNAUTHENTICATED(401, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(403, "You do not have permission", HttpStatus.FORBIDDEN),
    INVALID_ACCESSTOKEN(400, "Invalid access token", HttpStatus.BAD_REQUEST),
    INVALID_REFRESH_TOKEN(400, "Invalid refresh_token", HttpStatus.BAD_REQUEST),
    COOKIES_EMPTY(400, "You don't have refresh_token in cookies", HttpStatus.BAD_REQUEST),
    INVALID_KEY(400, "Invalid key", HttpStatus.BAD_REQUEST),
    INVALID_DOB(400, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),

    // USER
    USER_EXISTED(409, "User existed", HttpStatus.CONFLICT),  // 409 Conflict tốt hơn cho existed
    USER_NOT_EXISTED(404, "User not existed", HttpStatus.NOT_FOUND),
    USERNAME_INVALID(400, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_PASSWORD(400, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),

    // CATEGORY
    CATEGORY_EXISTED(409, "Category existed", HttpStatus.CONFLICT),
    CATEGORY_NOT_FOUND(404, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_HAS_COURSES(400, "Cannot delete category because it has courses", HttpStatus.BAD_REQUEST),

    // TAG
    TAG_NOT_FOUND(404, "Tag not found", HttpStatus.NOT_FOUND),
    INVALID_TAG_NAME(400, "Tag name is invalid", HttpStatus.BAD_REQUEST),

    // ORDER
    ORDER_NOT_FOUND(404, "Order not found", HttpStatus.NOT_FOUND),
    INVALID_PRICE_ORDER(400, "Price is invalid", HttpStatus.BAD_REQUEST),

    // ROLE & PERMISSION
    ROLE_NOT_EXISTED(404, "Role not existed", HttpStatus.NOT_FOUND),
    PERMISSION_NOT_EXISTED(404, "Permission not existed", HttpStatus.NOT_FOUND),
    INVALID_ROLE_NAME(400, "Role name is invalid", HttpStatus.BAD_REQUEST),

    // CART
    CARTDETAIL_NOT_EXISTED(404, "Cart detail not existed", HttpStatus.NOT_FOUND),

    // COURSE
    COURSE_EXISTED(409, "Course title already exists", HttpStatus.CONFLICT),
    COURSE_NOT_FOUND(404, "Course not found", HttpStatus.NOT_FOUND),
    COURSE_HAS_ENROLLMENTS_OR_REVIEWS(400, "Cannot delete course because it has active enrollments, reviews, or orders", HttpStatus.BAD_REQUEST),

    // VALIDATE GENERAL
    INVALID_PHONE_NUMBER(400, "Phone number is invalid", HttpStatus.BAD_REQUEST),
    INVALID_CATEGORY_NAME(400, "Category name is invalid", HttpStatus.BAD_REQUEST),

    // UNCATEGORIZED
    UNCATEGORIZED_EXCEPTION(500, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR);


    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    private final int code;
    private final String message;
    private final HttpStatusCode statusCode;
}