package com.education.udemy.service;

import com.education.udemy.dto.request.setting.SettingRequest;
import com.education.udemy.dto.response.setting.SettingResponse;
import com.education.udemy.entity.Setting;

import com.education.udemy.mapper.SettingMapper;
import com.education.udemy.repository.SettingRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SettingService {
    SettingRepository settingRepository;
    SettingMapper settingMapper;

    // 1. Lấy thông tin cài đặt hiện tại
    public SettingResponse getSettings() {
        Setting setting = settingRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> settingRepository.save(new Setting())); // Tạo mới nếu trắng DB
        return settingMapper.toResponse(setting);
    }

    // 2. Cập nhật thông tin cài đặt
    @Transactional
    public SettingResponse updateSettings(SettingRequest request) {
        log.info("Updating website settings");

        // Tìm bản ghi đầu tiên, nếu không thấy thì tạo mới
        Setting setting = settingRepository.findAll().stream()
                .findFirst()
                .orElse(new Setting());

        // Map dữ liệu từ Request vào Entity (giữ nguyên ID cũ)
        settingMapper.updateEntity(request, setting);

        return settingMapper.toResponse(settingRepository.save(setting));
    }
}
