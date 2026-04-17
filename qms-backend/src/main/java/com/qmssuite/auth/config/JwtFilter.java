package com.qmssuite.auth.config;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private final JwtConfig jwt;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest req) {
        String path = req.getRequestURI();
        // Skip on error dispatch (Spring re-dispatches to /error on 5xx)
        // Skip on public paths — handled here so doFilterInternal stays clean
        return path.equals("/error")
            || path.startsWith("/api/auth/login")
            || path.startsWith("/swagger-ui")
            || path.startsWith("/api-docs")
            || path.startsWith("/v3/api-docs")
            || path.startsWith("/actuator");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest req,
                                    @NonNull HttpServletResponse res,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        // Always pass OPTIONS preflight
        if ("OPTIONS".equals(req.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        String header = req.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            // No token — Spring Security entrypoint will return 401
            chain.doFilter(req, res);
            return;
        }

        String token = header.substring(7).trim();

        if (jwt.validate(token)) {
            String username = jwt.getUsername(token);
            log.debug("JWT valid — user: {}, path: {}", username, req.getRequestURI());
            SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                    username, null, List.of(new SimpleGrantedAuthority("ROLE_USER"))
                )
            );
            chain.doFilter(req, res);
        } else {
            log.warn("JWT rejected — path: {}", req.getRequestURI());
            res.setContentType("application/json;charset=UTF-8");
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            res.getWriter().write("{\"success\":false,\"error\":\"Token invalid or expired. Please login again.\"}");
            res.getWriter().flush();
        }
    }
}