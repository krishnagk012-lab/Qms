package com.qmssuite.auth.service;

import com.qmssuite.auth.dto.RegisterRequest;
import com.qmssuite.auth.dto.RegisterResponse;
import com.qmssuite.auth.entity.*;
import com.qmssuite.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RegisterService {

    private final OrganisationRepository orgRepo;
    private final UserRepository userRepo;
    private final SystemConfigRepository configRepo;
    private final PasswordEncoder encoder;

    /**
     * Returns true if this instance already has an organisation set up.
     * Used by the frontend to decide: show login (true) or registration wizard (false).
     */
    public boolean isSetupDone() {
        try {
            String val = configRepo.findValue("setup_done");
            return "true".equalsIgnoreCase(val);
        } catch (Exception e) {
            try { return userRepo.count() > 0; }
            catch (Exception ex) { return false; }
        }
    }

    /**
     * One-time organisation + first admin registration.
     * Blocked once setup is done — each deployment serves exactly one organisation.
     * Additional users must be created by the admin via the Users panel.
     */
    @Transactional
    public RegisterResponse register(RegisterRequest req) {

        // ── Guard 1: one organisation per deployment ──────────────────────
        if (isSetupDone()) {
            throw new IllegalStateException(
                "This QMS instance already has an organisation configured. " +
                "Please sign in, or ask your administrator to create an account for you.");
        }

        // ── Guard 2: no duplicate usernames ───────────────────────────────
        if (userRepo.existsByUsername(req.getUsername())) {
            throw new IllegalArgumentException(
                "Username '" + req.getUsername() + "' is already taken. Please choose another.");
        }

        // ── Create organisation ───────────────────────────────────────────
        OrganisationEntity org = OrganisationEntity.builder()
            .name(req.getOrgName())
            .shortName(req.getShortName())
            .nablCertNo(req.getNablCertNo())
            .address(req.getAddress())
            .city(req.getCity())
            .state(req.getState())
            .country(req.getCountry() != null ? req.getCountry() : "India")
            .pincode(req.getPincode())
            .phone(req.getPhone())
            .email(req.getOrgEmail())
            .website(req.getWebsite())
            .labType(req.getLabType())
            .accreditation(req.getAccreditation())
            .isActive(true)
            .setupComplete(true)
            .build();
        org = orgRepo.save(org);

        // ── Create first admin user ───────────────────────────────────────
        UserEntity admin = UserEntity.builder()
            .username(req.getUsername())
            .fullName(req.getFullName())
            .email(req.getEmail())
            .passwordHash(encoder.encode(req.getPassword()))
            .role("ADMIN")
            .department("Management")
            .isActive(true)
            .orgId(org.getId())
            .build();
        userRepo.save(admin);

        // ── Lock this instance to this organisation ───────────────────────
        configRepo.setValue("setup_done", "true");

        log.info("Organisation registered: '{}' | Admin: '{}'", org.getName(), req.getUsername());

        return RegisterResponse.builder()
            .orgId(org.getId())
            .orgName(org.getName())
            .username(req.getUsername())
            .fullName(req.getFullName())
            .message("Organisation registered successfully. You can now sign in.")
            .build();
    }
}
