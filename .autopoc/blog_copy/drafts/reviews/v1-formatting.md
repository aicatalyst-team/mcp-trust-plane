# Formatting Review: v1

**Reviewer**: Formatting (Editorial Compliance)
**Draft**: v1.md
**Date**: 2026-06-22

---

## Scores

| Dimension | Weight | Score (1-10) | Weighted |
|---|---|---|---|
| Heading hierarchy | 1x | 9 | 9 |
| Code formatting | 1x | 4 | 4 |
| CTA placement | 2x | 3 | 6 |
| SEO readiness | 1x | 8 | 8 |
| Link strategy | 1x | 3 | 3 |
| Editorial compliance | 2x | 6 | 12 |
| Brand standards | 1x | 6 | 6 |
| Word count | 1x | 8 | 8 |
| **Total** | **10x** | | **56** |

**Normalized score: 5.6 / 10**

---

## Line-level feedback

### Heading hierarchy (9/10)

Headings are well-structured: all body headings are H2, sentence case is used consistently, and no H1 appears in the body. The cascade is flat (all H2, no H3) but appropriate for the post length. No issues found.

### Code formatting (4/10)

**Critical**: The rubric requires no backticks in the final output. The draft uses inline backticks extensively:

- Line 12: `` `package.json` ``, `` `index.js` ``
- Line 22: `` `node:20-alpine` ``, `` `USER 0` ``
- Line 29: `` `ENV PORT=6001` ``
- Line 39: `` `npm install` ``
- Lines 67-75: multiple backtick-wrapped JSON fragments and inline code
- Lines 81-87: `` `node_modules` ``, `` `USER 0` ``, `` `chgrp -R 0` ``, etc.
- Lines 93-95: inline backtick commands

All inline backticks must be removed. Code references in running text should use monospace formatting per the Red Hat Developer Blog style (handled at render time by the CMS, not by markdown backticks).

The fenced code blocks themselves are good: the Dockerfile block has a correct `dockerfile` language label and contains real, runnable code. The mermaid block is properly labeled.

### CTA placement (3/10)

**Critical**: The CTA appears only at the very end ("Try it yourself", line 89). The rubric requires CTAs near the top, mid-post, and closing, all linked to redhat.com.

**Required fixes:**
1. Add an early CTA after the introduction (e.g., link to Red Hat OpenShift AI or the MCP Trust Plane project page).
2. Add a mid-post CTA after the deployment section (e.g., "Get started with Red Hat OpenShift AI" with a redhat.com link).
3. The closing CTA at line 89 needs a redhat.com link (e.g., to the OpenShift AI product page or a trial).

### SEO readiness (8/10)

Title is strong: "Securing AI Agent Tool Calls with MCP Trust Plane on OpenShift" is 62 characters (slightly over the 60-char ideal but acceptable). Keywords "MCP Trust Plane," "OpenShift," and "AI agent" all appear in the title and first paragraph. The first paragraph clearly states the problem and solution.

Minor improvement: consider front-loading "OpenShift" earlier in the title for SEO weight.

### Link strategy (3/10)

**Critical**: Zero links to redhat.com anywhere in the post. The rubric requires internal links to Red Hat properties.

**Required fixes:**
1. Link "OpenShift" on first mention to the Red Hat OpenShift product page.
2. Link "Red Hat UBI9" to the UBI documentation on redhat.com.
3. Link "Red Hat OpenShift AI" (from the abstract's products list) to its product page.
4. The existing GitHub links (lines 93, 99) are fine to keep.

### Editorial compliance (6/10)

**Acronyms not expanded on first use:**
- Line 12: "PII" used without expansion. Should be "personally identifiable information (PII)."
- Line 22: "UBI" used without expansion. Should be "Universal Base Image (UBI)." ("Red Hat UBI9" on line 22 is also non-standard; prefer "Red Hat Universal Base Image 9.")
- Line 61: "UID" not expanded. Should be "user ID (UID)."

**Contractions:**
The draft uses some contractions ("wasn't," "there's," "wouldn't," "don't," "we'll") but misses opportunities. The rubric says "use contractions aggressively."
- Line 10: "MCP Trust Plane addresses this" -> "MCP Trust Plane addresses this" (fine, but check for other stiff phrasing)
- Line 39: "there is no" -> "there's no" (already done, good)
- Line 81: "there is nothing" -> "there's nothing" (not present but similar patterns exist)

**Oxford commas:**
Generally correct. Line 61: "no privilege escalation, all capabilities dropped, and no `runAsUser` specified" uses the Oxford comma. Line 12's long list has no conjunction so no Oxford comma is needed.

**Product names:**
- Line 22: "Red Hat UBI9" is not the official product name. Use "Red Hat Universal Base Image (UBI) 9" on first mention.
- "OpenShift" is used correctly throughout without the "Red Hat" prefix after what should be a first-mention full name. Line 2 (title) says "OpenShift" -- the first body mention should say "Red Hat OpenShift" at least once.

**Em dashes:** None found. Good.

**Numerals:** Correctly used throughout ("6 filters," "5 scenarios," "60 filters," etc.).

### Brand standards (6/10)

The mermaid diagram uses Red Hat brand color `#EE0000`, which is a nice touch. However, the post never mentions "Red Hat OpenShift" with the full brand name in the body text. "Red Hat" appears only in the UBI image registry path and the Kubernetes manifest discussion. The post should establish the full product name "Red Hat OpenShift" on first body mention.

### Word count (8/10)

Approximately 880 words in the body, within the 800-1300 target range for a tutorial-style post.

---

## Editorial compliance checklist

| Rule | Status | Notes |
|---|---|---|
| Sentence case headings | Pass | All headings use sentence case |
| Oxford commas | Pass | Used where applicable |
| No backticks | **Fail** | 20+ inline backtick instances throughout |
| Full product name first mention | **Fail** | "UBI," "PII," "UID" not expanded; "Red Hat OpenShift" not used |
| Lowercase component descriptors | Pass | "MCP Trust Plane" used as proper noun (correct) |
| No H1 in body | Pass | All body headings are H2 |
| Expand acronyms first use | **Fail** | PII, UBI, UID not expanded |
| Contractions | Partial | Some used, but could be more aggressive |
| Numerals in text | Pass | "6 filters," "5 scenarios," etc. |
| No em dashes | Pass | None found |

---

## Summary

The draft has strong structural bones: heading hierarchy is clean, word count is on target, and SEO keywords are well-placed. The 3 critical issues dragging the score down are:

1. **Backticks everywhere** (code formatting, 4/10): Remove all inline backticks per Red Hat Developer Blog standards.
2. **No CTAs until the end** (CTA placement, 3/10): Add early and mid-post CTAs linking to redhat.com properties.
3. **No redhat.com links** (link strategy, 3/10): Add internal links to OpenShift, UBI, and OpenShift AI product pages.

Secondary issues: expand PII/UBI/UID acronyms on first use, use "Red Hat OpenShift" on first body mention, and increase contraction usage.

Fixing these issues should bring the score from **5.6** to the 7-8 range.
