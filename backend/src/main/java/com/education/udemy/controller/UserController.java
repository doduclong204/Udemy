package com.education.udemy.controller;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.request.user.UserUpdateRequest;
import com.education.udemy.dto.request.user.ChangePasswordRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.api.ApiString;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.entity.User;
import com.education.udemy.service.UserService;
import com.education.udemy.util.annotation.ApiMessage;
import com.education.udemy.util.annotation.PublicEndpoint;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserController {
    UserService userService;
    // UserExcelImport userExcelImport;

    @PublicEndpoint
    @PostMapping
    @ApiMessage("Create a user success")
    ResponseEntity<UserResponse> createUser(@RequestBody @Valid UserCreationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(this.userService.create(request));
    }

    @GetMapping
    @ApiMessage("Get all users success")
    ResponseEntity<ApiPagination<UserResponse>> getUsers(@Filter Specification<User> spec, Pageable pageable) {
        return ResponseEntity.ok().body(this.userService.getAllUsers(spec, pageable));
    }

    @GetMapping("/{id}")
    @ApiMessage("Get detail user success")
    ResponseEntity<UserResponse> getUser(@PathVariable("id") String id) {
        return ResponseEntity.ok().body(this.userService.getDetailUser(id));
    }

    @GetMapping("/my-info")
    @ApiMessage("Get my infor success")
    ResponseEntity<UserResponse> getMyInfo() {
        return ResponseEntity.ok().body(this.userService.getMyInfo());
    }

    @DeleteMapping("/{id}")
    @ApiMessage("Delete a user success")
    ResponseEntity<ApiString> delete(@PathVariable String id) {
        userService.delete(id);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }

    @PutMapping("/{id}")
    @ApiMessage("Update a user success")
    ResponseEntity<UserResponse> updateUser(@PathVariable String id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok().body(this.userService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @ApiMessage("Update user status success")
    ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable String id,
            @RequestBody boolean active) {
        return ResponseEntity.ok().body(this.userService.updateUserStatus(id, active));
    }

    @PatchMapping("/change-password")
    @ApiMessage("Change password success")
    ResponseEntity<ApiString> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        this.userService.changePassword(request);
        return ResponseEntity.ok().body(ApiString.builder()
                .message("success")
                .build());
    }
}