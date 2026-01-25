package com.grad.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

 @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for stateless APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll() // Allow authentication endpoints
                .requestMatchers("/api/images/**").permitAll() // Allow image endpoints
                .requestMatchers("/api/internal/**").permitAll() // Internal API (key-checked in controller)
                .requestMatchers("/api/companies/browse").permitAll() // Allow anyone to browse companies
                .requestMatchers("/api/proposals/create").permitAll()
                .requestMatchers("/api/proposals/MyProposals/**").authenticated()
                .requestMatchers("/api/proposals/delete/**").authenticated()
                .requestMatchers("/api/proposals/**").authenticated()
                .requestMatchers("/api/proposals/update/**").authenticated()
                .requestMatchers("/api/submissions/**").authenticated()
                .requestMatchers("/api/submissions/send-to-company").authenticated()
                .requestMatchers("/api/submissions/my-submissions").authenticated()
                .requestMatchers("/api/submissions/company-queue").authenticated()
                .requestMatchers("/api/contracts/**").authenticated()

                .anyRequest().authenticated() // All other requests require authentication
                
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Use stateless sessions for JWT
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // Add JWT filter

        return http.build();
    }
}
