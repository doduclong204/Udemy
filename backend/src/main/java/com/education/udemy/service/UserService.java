package com.education.udemy.service;

import com.education.udemy.dto.request.user.ChangePasswordRequest;
import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.education.udemy.constant.PredefinedRole;
import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.request.user.UserUpdateRequest;
import com.education.udemy.dto.response.api.ApiPagination;
import com.education.udemy.dto.response.user.UserResponse;
import com.education.udemy.entity.User;
import com.education.udemy.exception.AppException;
import com.education.udemy.exception.ErrorCode;
import com.education.udemy.mapper.UserMapper;
import com.education.udemy.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public UserResponse create(UserCreationRequest request) {
        log.info("Create a user");
        User user = this.userMapper.toUser(request);
        user.setPassword(this.passwordEncoder.encode(request.getPassword()));
        if (request.getRole() == null) {
            request.setRole(PredefinedRole.USER_ROLE);
            user.setRole(PredefinedRole.USER_ROLE);
        } else {
            user.setRole(request.getRole());
        }

        try {
            user = userRepository.save(user);
        } catch (DataIntegrityViolationException exception) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }
        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public UserResponse getMyInfo() {
        log.info("Get my info");
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    public UserResponse update(String userId, UserUpdateRequest request) {
        log.info("Update a user");
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        userMapper.updateUser(user, request);
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getUsername() != null && request.getUsername() != user.getUsername()) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new AppException(ErrorCode.USERNAME_INVALID);
            }
            user.setUsername(request.getUsername());
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void delete(String userId) {
        log.info("Delete a user");
        User user = this.userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        this.userRepository.delete(user);
    }

    @Transactional(readOnly = true)
    public ApiPagination<UserResponse> getAllUsers(Specification<User> spec, Pageable pageable) {
        log.info("Get all users");
        Page<User> pageUser = this.userRepository.findAll(spec, pageable);

        List<UserResponse> listUser = pageUser.getContent().stream().map(userMapper::toUserResponse).toList();

        ApiPagination.Meta mt = new ApiPagination.Meta();
        mt.setCurrent(pageable.getPageNumber() + 1);
        mt.setPageSize(pageable.getPageSize());
        mt.setPages(pageUser.getTotalPages());
        mt.setTotal(pageUser.getTotalElements());

        return ApiPagination.<UserResponse>builder()
                .meta(mt)
                .result(listUser)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        log.info("Get all users");
        List<User> entities = this.userRepository.findAll();
        return entities.stream().map(userMapper::toUserResponse).toList();
    }

    @Transactional(readOnly = true)
    public UserResponse getDetailUser(String id) {
        log.info("Get detail a user");
        return userMapper.toUserResponse(
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    public User handleGetUserByUsername(String username) {
        return this.userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public void updateUserToken(String token, String username) {
        User currentUser = this.handleGetUserByUsername(username);
        if (currentUser != null) {
            currentUser.setRefreshToken(token);
            this.userRepository.save(currentUser);
        }
    }

    public boolean isExistByUsername(String username) {
        return this.userRepository.existsByUsername(username);
    }

    public void handleLogout(User user) {
        user.setRefreshToken(null);
        this.userRepository.save(user);
    }

    public User getUserByRefreshTokenAndUsername(String token, String username) {
        return this.userRepository.findByRefreshTokenAndUsername(token, username);
    }

    public UserResponse updateUserStatus(String id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        user.setActive(active);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void changePassword(ChangePasswordRequest request) {
        log.info("Change password");
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_INCORRECT);
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.PASSWORD_NOT_MATCH);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}