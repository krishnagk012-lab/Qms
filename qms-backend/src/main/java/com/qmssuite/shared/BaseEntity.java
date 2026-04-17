package com.qmssuite.shared;
import jakarta.persistence.*;
import lombok.Getter;import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.Instant;import java.util.UUID;
@Getter @Setter @MappedSuperclass
public abstract class BaseEntity {
    @Id @UuidGenerator @Column(updatable=false,nullable=false) private UUID id;
    @CreationTimestamp @Column(name="created_at",updatable=false) private Instant createdAt;
    @UpdateTimestamp @Column(name="updated_at") private Instant updatedAt;
}