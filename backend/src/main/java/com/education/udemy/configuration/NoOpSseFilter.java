/*package com.education.udemy.configuration;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Enumeration;

@Component
public class NoOpSseFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String servletPath = request.getServletPath();
        String token = request.getParameter("token");

        if (servletPath.startsWith("/sse") && token != null && !token.isBlank()
                && request.getHeader("Authorization") == null) {

            HttpServletRequestWrapper wrapped = new HttpServletRequestWrapper(request) {
                @Override
                public String getHeader(String name) {
                    if ("Authorization".equalsIgnoreCase(name)) return "Bearer " + token;
                    return super.getHeader(name);
                }

                @Override
                public Enumeration<String> getHeaders(String name) {
                    if ("Authorization".equalsIgnoreCase(name))
                        return Collections.enumeration(Collections.singletonList("Bearer " + token));
                    return super.getHeaders(name);
                }

                @Override
                public Enumeration<String> getHeaderNames() {
                    return super.getHeaderNames();
                }
            };

            filterChain.doFilter(wrapped, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}*/