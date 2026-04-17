package com.qmssuite.shared;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditTrailRepository repo;

    public void log(String username, String action, String table, String recordId, String newVal) {
        try {
            // Wrap plain strings as valid JSON so PostgreSQL jsonb accepts them
            String jsonNew = toJson(newVal);

            repo.save(AuditTrailEntity.builder()
                .eventTime(Instant.now())
                .username(username != null ? username : "system")
                .action(action)
                .tableName(table)
                .recordId(recordId)
                .newValue(jsonNew)
                .build());
        } catch (Exception e) {
            // Never let audit logging break the main flow
            log.warn("Audit log failed (non-critical): action={}, table={}, record={} — {}",
                action, table, recordId, e.getMessage());
        }
    }

    private String toJson(String value) {
        if (value == null) return null;
        String v = value.trim();
        if (v.startsWith("{") || v.startsWith("[")) return v;   // already JSON
        // Escape and wrap as JSON string value
        return "{\"value\":\"" + v.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}";
    }
}