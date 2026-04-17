package com.qmssuite.auth.entity;
import com.qmssuite.shared.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name="organisations")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class OrganisationEntity extends BaseEntity {
    @Column(nullable=false, length=200) private String name;
    @Column(name="short_name", length=60) private String shortName;
    @Column(name="nabl_cert_no", length=60) private String nablCertNo;
    @Column(columnDefinition="TEXT") private String address;
    @Column(length=80) private String city;
    @Column(length=80) private String state;
    @Column(length=80) private String country;
    @Column(length=20) private String pincode;
    @Column(length=30) private String phone;
    @Column(length=120) private String email;
    @Column(length=200) private String website;
    @Column(name="lab_type", length=60) private String labType;
    @Column(length=60) private String accreditation;
    @Column(name="is_active") private boolean isActive = true;
    @Column(name="setup_complete") private boolean setupComplete = false;
}
