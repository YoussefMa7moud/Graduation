# CORS Configuration Guide for Spring Boot Backend

## Problem
Your frontend (running on `http://localhost:5173`) is being blocked by CORS policy when trying to access your Spring Boot backend (running on `http://localhost:8080`).

## Solution: Configure CORS in Spring Boot

You need to configure CORS in your Spring Boot backend to allow requests from your frontend.

### Option 1: Global CORS Configuration (Recommended)

Create a CORS configuration class in your Spring Boot backend:

**File: `src/main/java/com/yourpackage/config/CorsConfig.java`**

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow credentials (cookies, authorization headers)
        config.setAllowCredentials(true);
        
        // Allow specific origins (add your frontend URL)
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",  // Vite dev server
            "http://localhost:3000",   // Alternative React dev server
            "http://127.0.0.1:5173"    // Alternative localhost format
        ));
        
        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc.)
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow exposed headers
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        
        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);
        
        // Apply CORS configuration to all paths
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
```

### Option 2: Controller-Level CORS (Alternative)

If you prefer to configure CORS at the controller level:

**In your AuthController:**

```java
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    // Your controller methods
}
```

### Option 3: WebMvcConfigurer (Alternative)

**File: `src/main/java/com/yourpackage/config/WebConfig.java`**

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

## For File Upload (Multipart Requests)

If you're uploading files (like company logos), make sure your Spring Boot backend:

1. **Has multipart configuration** in `application.properties` or `application.yml`:

```properties
# application.properties
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
```

Or in `application.yml`:

```yaml
spring:
  servlet:
    multipart:
      enabled: true
      max-file-size: 10MB
      max-request-size: 10MB
```

2. **Controller method accepts MultipartFile**:

```java
@PostMapping("/register")
public ResponseEntity<?> register(
    @RequestParam("email") String email,
    @RequestParam("password") String password,
    @RequestParam("role") String role,
    @RequestParam("firstName") String firstName,
    @RequestParam("lastName") String lastName,
    @RequestParam(value = "companyLogo", required = false) MultipartFile companyLogo,
    // ... other parameters
) {
    // Handle registration
    // Save companyLogo if provided
}
```

## Testing CORS

After configuring CORS:

1. **Restart your Spring Boot backend**
2. **Clear browser cache** (Ctrl+Shift+R)
3. **Try registration/login again**

## Common Issues

### Issue: Still getting CORS errors
- **Solution**: Make sure you restarted the Spring Boot server after adding CORS configuration
- **Check**: Verify the allowed origins match your frontend URL exactly (including port)

### Issue: Preflight (OPTIONS) request fails
- **Solution**: Ensure `OPTIONS` method is in the allowed methods list
- **Check**: Your CORS configuration should handle OPTIONS requests automatically

### Issue: Credentials not working
- **Solution**: Set `allowCredentials(true)` in CORS config
- **Note**: When using credentials, you cannot use `allowedOrigins("*")` - you must specify exact origins

## Production Configuration

For production, update the allowed origins:

```java
config.setAllowedOrigins(Arrays.asList(
    "https://your-production-domain.com",
    "https://www.your-production-domain.com"
));
```

Or use environment variables:

```java
@Value("${cors.allowed-origins}")
private String allowedOrigins;

// Then in application.properties:
// cors.allowed-origins=http://localhost:5173,https://your-domain.com
```

## Additional Resources

- [Spring CORS Documentation](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
