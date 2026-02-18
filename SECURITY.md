# Security Policy

## Reporting a Vulnerability

**Do NOT open a public issue for security vulnerabilities.**

If you discover a security vulnerability, please email **security@snaplink.app** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if applicable)

We will:
1. Acknowledge receipt within 24 hours
2. Provide a timeline for fix
3. Release a security patch
4. Credit the reporter (unless you prefer anonymity)

---

## Security Measures

### Authentication
- ✅ **Passwords:** Hashed with bcrypt (10 rounds)
- ✅ **Sessions:** JWT-based, stored securely in HTTP-only cookies
- ✅ **OAuth:** GitHub OAuth2 via NextAuth.js
- ✅ **CSRF Protection:** Token-based CSRF protection
- ✅ **Rate Limiting:** Prevents brute force attacks

### Data Protection
- ✅ **Encryption:** HTTPS/TLS 1.3 (enforced in production)
- ✅ **Passwords:** Never logged, hashed immediately
- ✅ **IP Privacy:** IPs hashed with SHA-256 (never stored raw)
- ✅ **Soft Deletes:** Data preserved for audit trails
- ✅ **SQL Injection:** Prevented via Drizzle ORM parameterized queries

### Code Security
- ✅ **TypeScript Strict Mode:** Type safety prevents runtime errors
- ✅ **Input Validation:** Zod schemas validate all user inputs
- ✅ **XSS Protection:** React auto-escaping + Content Security Policy
- ✅ **CORS:** Configured to prevent cross-origin attacks
- ✅ **Security Headers:** All OWASP headers configured

### Infrastructure
- ✅ **Environment Variables:** Never committed to git
- ✅ **Secrets Management:** Handled by deployment platform
- ✅ **Dependency Updates:** Automated via Dependabot
- ✅ **Vulnerability Scanning:** npm audit on every build

---

## Known Security Considerations

### Session Management
- Sessions stored in database
- Max age: 30 days
- Soft refresh: 24 hours
- Logout clears session immediately

### Rate Limiting
- Anonymous: 5 requests/hour per IP
- Authenticated: 100 requests/minute per user
- Redirect endpoint: 1000 requests/minute per link

Limits are configurable via environment variables.

### Data Retention
- User data: Retained until account deletion
- Click events: 90 days (archived after)
- Session tokens: 30 days maximum
- Deleted links: Soft-deleted (data preserved)

### Third-Party Services
- **Sentry:** Error tracking (no PII by default)
- **GitHub OAuth:** Standard OAuth2 flow
- **NextAuth.js:** Industry-standard auth library

---

## Security Best Practices

### For Users
1. Use strong, unique passwords (8+ chars, mixed case, numbers)
2. Enable two-factor authentication on GitHub account
3. Keep links private if sensitive
4. Don't include sensitive info in URLs
5. Use HTTPS only (enforced)

### For Developers
1. Keep dependencies updated: `npm update`
2. Check for vulnerabilities: `npm audit`
3. Validate all inputs (use Zod)
4. Never log sensitive data
5. Review security headers before deployment
6. Test authentication flows thoroughly
7. Use environment variables for secrets

---

## Vulnerability Disclosure

We follow responsible disclosure:

1. **Discovery:** Researcher discovers vulnerability
2. **Report:** Researcher reports to security@snaplink.app
3. **Assessment:** We assess severity and timeline
4. **Fix:** We develop and test fix
5. **Release:** We release security patch
6. **Disclosure:** Public announcement after patch is available
7. **Credit:** Researcher credited (with permission)

---

## Compliance

### Standards Met
- ✅ **OWASP Top-10:** All items addressed
- ✅ **GDPR:** Soft deletes, data export, deletion support
- ✅ **WCAG 2.1:** Accessible design
- ✅ **CWE:** Common Weakness Enumeration mitigations

### Audit Readiness
We maintain security readiness for:
- Third-party security audits
- Penetration testing
- Compliance assessments
- SOC 2 Type II certification (roadmap)

---

## Security Roadmap

### v1.0 (MVP) — Current
- ✅ Basic HTTPS/TLS
- ✅ Password hashing
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input validation

### v1.1 (Security Hardening)
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection
- [ ] Intrusion detection
- [ ] Advanced threat detection
- [ ] Security audit report

### v2.0+ (Enterprise)
- [ ] Two-factor authentication
- [ ] Single sign-on (SSO)
- [ ] Audit logs (immutable)
- [ ] Encryption at rest
- [ ] Key rotation
- [ ] SOC 2 Type II compliance
- [ ] ISO 27001 certification

---

## Dependencies

Critical security dependencies:
- **NextAuth.js:** Authentication framework
- **bcrypt:** Password hashing
- **zod:** Input validation
- **drizzle-orm:** SQL parameterization

All dependencies:
- Use `npm audit` to check
- Use Dependabot for automated updates
- Pin versions in lock file

---

## Support

- **Security Questions:** security@snaplink.app
- **Bug Reports:** GitHub Issues (public, non-security)
- **Feature Requests:** GitHub Discussions

---

## Acknowledgments

Thanks to security researchers who have helped improve SnapLink:
- (To be filled in as we receive reports)

---

**Last Updated:** 2026-02-19  
**Policy Version:** 1.0  
**Next Review:** 2026-05-19

