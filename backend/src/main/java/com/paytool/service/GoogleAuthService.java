package com.paytool.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.paytool.model.User;
import com.paytool.repository.UserRepository;
import com.paytool.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final String googleClientId;

    public GoogleAuthService(
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider,
            @Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.googleClientId = googleClientId;
    }

    @Transactional
    public Map<String, Object> authenticateGoogleUser(String idTokenString) throws Exception {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance())
            .setAudience(Collections.singletonList(googleClientId))
            .build();

        GoogleIdToken idToken = verifier.verify(idTokenString);
        if (idToken == null) {
            throw new IllegalArgumentException("Invalid ID token.");
        }

        Payload payload = idToken.getPayload();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        System.out.println("Google Auth Info - Email: " + email);
        System.out.println("Google Auth Info - Name: " + name);
        System.out.println("Google Auth Info - Picture: " + picture);

        // Find or create user
        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    System.out.println("Existing user found - Current username: " + existingUser.getUsername());
                    System.out.println("Existing user found - Current name: " + existingUser.getName());
                    // Always update the username and name with Google info
                    if (name != null) {
                        System.out.println("Updating user info - New name: " + name);
                        existingUser.setName(name);
                        existingUser.setUsername(name);
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    System.out.println("Creating new user with name: " + name);
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name);
                    // Use Google name as username if available, otherwise use email prefix
                    newUser.setUsername(name != null ? name : email.split("@")[0]);
                    // Set a secure random password
                    newUser.setPassword(java.util.UUID.randomUUID().toString());
                    return userRepository.save(newUser);
                });

        System.out.println("Final user info - Username: " + user.getUsername());
        System.out.println("Final user info - Name: " + user.getName());

        // Now generate your own JWT for your app:
        String jwt = jwtTokenProvider.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("avatar", picture);
        
        return response;
    }
} 