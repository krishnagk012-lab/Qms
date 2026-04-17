package com.qmssuite.auth.dto;
import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RegisterRequest {
    // Organisation fields
    @NotBlank String orgName;
    String shortName;
    String nablCertNo;
    String address;
    String city;
    String state;
    String country = "India";
    String pincode;
    String phone;
    String orgEmail;
    String website;
    String labType;        // TESTING / CALIBRATION / BOTH
    String accreditation;  // NABL / ISO / BOTH / NONE

    // First admin user
    @NotBlank String username;
    @NotBlank String fullName;
    @NotBlank @Email String email;
    @NotBlank @Size(min=6) String password;
}
