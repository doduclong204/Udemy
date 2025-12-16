package com.education.udemy.controller;

import com.turkraft.springfilter.boot.Filter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.education.udemy.dto.request.user.UserCreationRequest;
import com.education.udemy.dto.request.user.UserUpdateRequest;
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

//     @CrossOrigin(origins = "*", exposedHeaders = "Content-Disposition")
//     @GetMapping("/excel/export")
//     @ApiMessage("Export all users success")
//     public void exportToExcel(HttpServletResponse response) throws IOException {
//         response.setContentType("application/octet-stream");
//         DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd_HH:mm:ss");
//         String currentDateTime = dateFormatter.format(new Date());
//
//         String headerKey = "Content-Disposition";
//         String headerValue = "attachment; filename=users_" + currentDateTime + ".xlsx";
//         response.setHeader(headerKey, headerValue);
//
//         List<UserResponse> listUsers = this.userService.getAllUsers();
//
//         UserExcelExporter excelExporter = new UserExcelExporter(listUsers);
//
//         excelExporter.export(response);
//     }
//
//     @PostMapping("/excel/import")
//     @ApiMessage("Import all users success")
//     public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
//         String message = "";
//         if (userExcelImport.hasExcelFormat(file)) {
//             try {
//                 List<UserResponse> res = userService.saveFromFileExcel(file);
//                 message = "The Excel file is uploaded: " + file.getOriginalFilename();
//
//                 return ResponseEntity.ok().body(res);
//             } catch (Exception exp) {
//                 message = "The Excel file is not upload: " + file.getOriginalFilename() + "!";
//                 // return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
//
//                 return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
//             }
//         }
//         message = "Please upload an excel file!";
//         return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(message);
//     }
}

