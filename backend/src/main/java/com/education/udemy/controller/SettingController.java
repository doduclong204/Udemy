package com.education.udemy.controller;

import com.education.udemy.dto.request.setting.SettingRequest;
import com.education.udemy.dto.response.api.ApiResponse;
import com.education.udemy.dto.response.setting.SettingResponse;
import com.education.udemy.service.SettingService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SettingController {
    SettingService settingService;

    @GetMapping
    public ApiResponse<SettingResponse> getSettings() {
        return ApiResponse.<SettingResponse>builder()
                .data(settingService.getSettings())
                .build();
    }

    @PutMapping
    public ApiResponse<SettingResponse> updateSettings(@RequestBody @Valid SettingRequest request) {
        return ApiResponse.<SettingResponse>builder()
                .data(settingService.updateSettings(request))
                .build();
    }
}
