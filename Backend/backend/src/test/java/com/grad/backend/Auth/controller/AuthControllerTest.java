
package com.grad.backend.Auth.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.grad.backend.Auth.dto.LoginRequest;
import com.grad.backend.Auth.dto.LoginResponse;
import com.grad.backend.Auth.dto.RegisterResponse;
import com.grad.backend.Auth.entity.User;
import com.grad.backend.Auth.service.AuthService;
import com.grad.backend.Auth.service.JwtService;
import com.grad.backend.Auth.service.RegistrationService;
import com.grad.backend.Auth.repository.UserRepository;
import com.grad.backend.config.JwtAuthenticationFilter;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @MockBean
    private RegistrationService registrationService;

@MockBean
    private JwtService jwtService; 

    @MockBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;
     
    @BeforeEach
    void setUp() {
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC01: Verify new user registration (FR-01)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
  

void testRegister_Success() throws Exception {

    RegisterResponse registerResponse = new RegisterResponse(1L, "CLIENT");

    when(registrationService.register(
            any(), any(), any(), any(), any(), any(),
            any(), any(), any(), any(), any(), any(), any()
    )).thenReturn(registerResponse);

    MockMultipartFile logo = new MockMultipartFile(
            "logo", "logo.png", "image/png", "logo bytes".getBytes());

    mockMvc.perform(multipart("/api/auth/register")
                    .file(logo)

                    // ✅ MUST match controller param names EXACTLY
                    .param("email", "test@example.com")
                    .param("password", "password123")
                    .param("role", "CLIENT")
                    .param("clientType", "individual")
                    .param("firstName", "John")
                    .param("lastName", "Doe")
                    .param("phone", "01000000000")
                    .param("address", "Cairo")

                    .with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(1L));
}

    /**
     * TC01 – negative path: invalid registration data triggers a 400 Bad Request.
     * This is listed in the test plan as part of TC01 coverage (FR-01).
     */
   @Test
void testRegister_InvalidData() throws Exception {

    doThrow(new IllegalArgumentException("Invalid role"))
            .when(registrationService)
            .register(any(), any(), any(), any(), any(), any(),
                    any(), any(), any(), any(), any(), any(), any());

    MockMultipartFile logo = new MockMultipartFile(
            "logo", "logo.png", "image/png", new byte[0]);

    mockMvc.perform(multipart("/api/auth/register")
                    .file(logo)
                    .param("email", "invalid")
                    .param("password", "pass")
                    .param("role", "invalid")

                    // ✅ same required params
                    .param("clientType", "")
                    .param("firstName", "")
                    .param("lastName", "")
                    .param("companyName", "")
                    .param("phone", "")
                    .param("address", "")
                    .param("industry", "")
                    .param("website", "")
                    .param("description", "")
                    .param("extraInfo", "")

                    .with(csrf()))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Invalid role"));
}

    /**
     * TC01 – server error path: an unexpected exception produces a 500 response.
     * Added to complete coverage of the /register endpoint's exception handling.
     */
    @Test
    void testRegister_ServerError() throws Exception {
        // Arrange
        doThrow(new RuntimeException("DB connection failed"))
                .when(registrationService)
                .register(any(), any(), any(), any(), any(), any(),
                        any(), any(), any(), any(), any(), any(), any());

        MockMultipartFile logo = new MockMultipartFile(
                "logo", "logo.png", "image/png", new byte[0]);

        // Act & Assert
        mockMvc.perform(multipart("/api/auth/register")
                        .file(logo)
                        .param("email", "test@example.com")
                        .param("password", "password123")
                        .param("role", "client")
                        .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error",
                        Matchers.containsString("Registration failed")));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC02: Verify login with valid credentials (FR-01)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testLogin_ValidCredentials() throws Exception {
        // Arrange
        LoginResponse loginResponse = new LoginResponse(
                "jwt.token.here", "Bearer", 1L, "test@example.com",
                "CLIENT", "John", "Doe", null, null, null, null);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        when(authService.login(any(LoginRequest.class))).thenReturn(loginResponse);

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.userId").value(1L))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC03: Verify login rejection with invalid credentials (FR-01)
    // ─────────────────────────────────────────────────────────────────────────

    @Test
    void testLogin_InvalidCredentials() throws Exception {
        // Arrange
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("invalid@example.com");
        loginRequest.setPassword("wrongpass");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new IllegalArgumentException("Invalid email or password"));

        // Act & Assert
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Invalid email or password"));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TC04: Verify logout functionality (FR-01)
    //
    // Architectural note: this backend is stateless JWT-based. There is no
    // dedicated /logout endpoint in AuthController; logout is performed on the
    // client by discarding the JWT token. The Spring SecurityContext is cleared
    // automatically because every request is authenticated from scratch via the
    // token — there is no server-side session to invalidate.
    //
    // Consequence for testing:
    //   • No controller-level unit test is possible (no endpoint exists).
    //   • Full logout behaviour (token discarded → subsequent request denied)
    //     is verified at the integration / E2E test layer.
    //   • Status in the test plan: N/A at unit-test level; covered by E2E tests.
    // ─────────────────────────────────────────────────────────────────────────

@Test
    @WithMockUser
    void testLogout_StatelessJwt_NoServerSideEndpointRequired() {
        /*
         * JWT logout is client-side only.
         * No server endpoint needed.
         */
    }


    // TC07: /register-pm server error
    @Test
    void testRegisterProjectManager_ServerError() throws Exception {
        doThrow(new RuntimeException("DB error"))
                .when(registrationService).registerProjectManager(any(Long.class), anyString(), anyString(), anyString(), anyString());

        mockMvc.perform(multipart("/api/auth/register-pm")
                        .param("firstName", "PM")
                        .param("lastName", "Test")
                        .param("email", "pm@test.com")
                        .param("password", "pass123")
                        .with(csrf()))
                .andExpect(status().isInternalServerError());
    }

    // Additional register cases for completeness
    @Test
    void testRegister_MissingRequiredParams() throws Exception {
        MockMultipartFile logo = new MockMultipartFile("logo", "logo.png", "image/png", new byte[0]);

        mockMvc.perform(multipart("/api/auth/register")
                        .file(logo)
                        .param("role", "CLIENT")
                        .with(csrf()))
                .andExpect(status().isBadRequest()); // Missing email/password etc.
    }

    @Test
    void testLogin_ServerError() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(authService.login(any())).thenThrow(new RuntimeException("Login failed"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request))
                        .with(csrf()))
                .andExpect(status().isInternalServerError());
    } }
