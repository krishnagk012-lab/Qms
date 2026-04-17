package com.qmssuite.auth.service;
import com.qmssuite.auth.config.JwtConfig;
import com.qmssuite.auth.dto.*;
import com.qmssuite.auth.entity.UserEntity;
import com.qmssuite.auth.repository.UserRepository;
import com.qmssuite.shared.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;import java.util.List;import java.util.UUID;
@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtConfig jwt;
    private final AuditService audit;

    public LoginResponse login(LoginRequest req){
        UserEntity u=userRepo.findByUsername(req.getUsername())
            .filter(UserEntity::isActive)
            .orElseThrow(()->new BadCredentialsException("Invalid credentials"));
        if(!encoder.matches(req.getPassword(),u.getPasswordHash()))
            throw new BadCredentialsException("Invalid credentials");
        u.setLastLogin(Instant.now()); userRepo.save(u);
        audit.log(u.getUsername(),"LOGIN","users",u.getId().toString(),null);
        return LoginResponse.builder()
            .token(jwt.generate(u.getUsername(),u.getRole()))
            .username(u.getUsername()).fullName(u.getFullName())
            .role(u.getRole()).email(u.getEmail()).build();
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest req){
        if(userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already exists");
        UserEntity u=UserEntity.builder()
            .username(req.getUsername()).fullName(req.getFullName())
            .role(req.getRole()).department(req.getDepartment())
            .email(req.getEmail()).passwordHash(encoder.encode(req.getPassword()))
            .isActive(true).build();
        userRepo.save(u);
        return toDTO(u);
    }

    public List<UserDTO> getAll(){ return userRepo.findAll().stream().map(this::toDTO).toList(); }

    private UserDTO toDTO(UserEntity u){
        return UserDTO.builder().id(u.getId()).username(u.getUsername())
            .fullName(u.getFullName()).role(u.getRole()).department(u.getDepartment())
            .email(u.getEmail()).isActive(u.isActive()).lastLogin(u.getLastLogin())
            .createdAt(u.getCreatedAt()).build();
    }
}