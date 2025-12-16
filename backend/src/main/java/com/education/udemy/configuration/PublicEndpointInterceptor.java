package com.education.udemy.configuration;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.education.udemy.util.annotation.PublicEndpoint;


@Component
public class PublicEndpointInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        // Kiểm tra nếu handler là một method của controller
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;
            // Kiểm tra xem method có annotation @PublicEndpoint hay không
            var vip = handlerMethod.getMethodAnnotation(PublicEndpoint.class);
            if (vip != null) {
                System.out
                        .println(">>> check public endpoint" + vip);
                return true; // Bỏ qua xử lý bảo mật
            }
        }

        // Tiếp tục các xử lý khác (vd: xác thực, ủy quyền)
        return true;
    }
}
