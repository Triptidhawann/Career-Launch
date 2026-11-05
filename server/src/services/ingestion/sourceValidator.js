import dns from 'node:dns/promises'
import { URL } from 'node:url'

/**
 * Validates whether an IP address belongs to private, loopback, link-local, or reserved ranges.
 * Implements strict SSRF protection for both IPv4 and IPv6.
 *
 * @param {string} ip
 * @returns {boolean} True if the IP is private/internal/reserved
 */
export function isPrivateOrReservedIP(ip) {
  if (!ip || typeof ip !== 'string') return true

  // Handle IPv6 addresses
  if (ip.includes(':')) {
    const lower = ip.toLowerCase().trim()

    // Loopback (::1 or 0:0:0:0:0:0:0:1)
    if (lower === '::1' || lower === '::' || lower === '0:0:0:0:0:0:0:1') return true

    // Link-local (fe80::/10 -> fe80: to febf:)
    if (/^fe[89ab]/i.test(lower)) return true

    // Unique Local Addresses (fc00::/7 -> fc00 to fdff)
    if (/^f[cd]/i.test(lower)) return true

    // IPv4-mapped IPv6 (::ffff:127.0.0.1)
    if (lower.startsWith('::ffff:')) {
      const v4 = lower.replace('::ffff:', '')
      return isPrivateOrReservedIP(v4)
    }

    // Public IPv6 addresses (e.g., 2000::/3 including Fastly/Cloudflare/AWS 2a04:...) are permitted
    return false
  }

  // Handle IPv4 addresses
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return true
  }

  const [b0, b1] = parts

  // 127.0.0.0/8 (Loopback)
  if (b0 === 127) return true

  // 0.0.0.0/8 (Current network)
  if (b0 === 0) return true

  // 10.0.0.0/8 (Private Class A)
  if (b0 === 10) return true

  // 172.16.0.0/12 (Private Class B: 172.16.0.0 - 172.31.255.255)
  if (b0 === 172 && b1 >= 16 && b1 <= 31) return true

  // 192.168.0.0/16 (Private Class C)
  if (b0 === 192 && b1 === 168) return true

  // 169.254.0.0/16 (Link-local / Cloud metadata e.g. AWS 169.254.169.254)
  if (b0 === 169 && b1 === 254) return true

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (b0 === 100 && b1 >= 64 && b1 <= 127) return true

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (b0 >= 224) return true

  return false
}

/**
 * Validates a target URL against SSRF threats and source-specific allowed domains.
 *
 * @param {string} targetUrl
 * @param {string[]} allowedDomains
 * @returns {Promise<{ valid: boolean, reason?: string, resolvedIp?: string }>}
 */
export async function validateUrlSafety(targetUrl, allowedDomains = []) {
  let parsed
  try {
    parsed = new URL(targetUrl)
  } catch {
    return { valid: false, reason: 'Malformed or invalid URL string.' }
  }

  // Enforce HTTP / HTTPS protocol
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, reason: `Unsupported protocol: ${parsed.protocol}. Only http: and https: are permitted.` }
  }

  const hostname = parsed.hostname.toLowerCase()

  // Verify hostname is present in the source's pre-approved domain whitelist
  if (!allowedDomains || allowedDomains.length === 0) {
    return { valid: false, reason: 'Source specifies no allowed domains whitelist.' }
  }

  const isDomainAllowed = allowedDomains.some((d) => {
    const domain = d.toLowerCase().trim()
    return hostname === domain || hostname.endsWith(`.${domain}`)
  })

  if (!isDomainAllowed) {
    return {
      valid: false,
      reason: `Hostname "${hostname}" is not in the source's approved allowed domains list: [${allowedDomains.join(', ')}].`,
    }
  }

  // Pre-flight DNS resolution to check for internal/loopback IP address
  try {
    const lookupResult = await dns.lookup(hostname)
    const ip = lookupResult.address

    if (isPrivateOrReservedIP(ip)) {
      return {
        valid: false,
        reason: `SSRF Blocked: Hostname "${hostname}" resolves to private/internal IP address (${ip}).`,
      }
    }

    return { valid: true, resolvedIp: ip }
  } catch (dnsErr) {
    return { valid: false, reason: `DNS lookup failed for hostname "${hostname}": ${dnsErr.message}` }
  }
}

/**
 * Validates a KnowledgeSource record's licensing and permissions.
 *
 * Rejects ingestion if:
 * 1. Licence is missing, ambiguous, or lacks commercial use permission.
 * 2. Storage or indexing is prohibited.
 * 3. Ingestion method is unsupported.
 *
 * @param {object} source
 * @returns {{ approved: boolean, reason?: string, mode: 'full' | 'link_only' | 'rejected' }}
 */
export function validateSourceLicence(source) {
  if (!source) {
    return { approved: false, reason: 'Source object is missing or null.', mode: 'rejected' }
  }

  const { licence, ingestionMethod, allowedDomains } = source

  if (!licence || typeof licence !== 'object') {
    return { approved: false, reason: 'Missing licence metadata block.', mode: 'rejected' }
  }

  const spdx = (licence.spdxId || '').trim().toUpperCase()

  // Non-commercial licenses (e.g., CC BY-NC, CC BY-NC-SA) violate CareerLaunch's commercial compatibility standard
  if (spdx.includes('-NC') || licence.commercialUsePermitted === false) {
    return {
      approved: false,
      reason: `Non-commercial licence (${licence.spdxId || 'NC'}) violates production commercial-compatibility requirement. Content under non-commercial terms cannot be ingested into the production knowledge foundation.`,
      mode: 'rejected',
    }
  }

  // Must permit indexing
  if (licence.indexingPermitted !== true) {
    return {
      approved: false,
      reason: `Licence ${licence.spdxId} explicitly forbids indexing of content.`,
      mode: 'rejected',
    }
  }

  // Storage permission check
  if (licence.storagePermitted !== true) {
    return {
      approved: true,
      reason: 'Source does not permit full text persistence; restricted to link-only and metadata reference.',
      mode: 'link_only',
    }
  }

  // Validate ingestion method
  const permittedMethods = ['static_dump', 'structured_api', 'whitelisted_html', 'git_clone']
  if (!permittedMethods.includes(ingestionMethod)) {
    return {
      approved: false,
      reason: `Unsupported or unverified ingestion method: "${ingestionMethod}". Permitted: ${permittedMethods.join(', ')}.`,
      mode: 'rejected',
    }
  }

  // Allowed domains check
  if (!Array.isArray(allowedDomains) || allowedDomains.length === 0) {
    return {
      approved: false,
      reason: 'Allowed domains whitelist is empty. An explicit domain allowlist is required for SSRF defense.',
      mode: 'rejected',
    }
  }

  return {
    approved: true,
    reason: `Verified commercial-compatible licence (${licence.spdxId}). Full storage and indexing permitted.`,
    mode: 'full',
  }
}
