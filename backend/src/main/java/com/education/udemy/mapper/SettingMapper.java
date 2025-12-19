package com.education.udemy.mapper;

import com.education.udemy.dto.request.setting.SettingRequest;
import com.education.udemy.dto.response.setting.SettingResponse;
import com.education.udemy.entity.Setting;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SettingMapper {
    // Trả dữ liệu về cho Client
    SettingResponse toResponse(Setting setting);

    // Cập nhật từ Request vào Entity đang tồn tại trong DB
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntity(SettingRequest request, @MappingTarget Setting setting);
}
