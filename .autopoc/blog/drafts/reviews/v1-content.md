# Content Review -- v1

## Scores
| Dimension | Raw (1-10) | Weight | Weighted |
|---|---|---|---|
| Technical accuracy | 8 | 2x | 16 |
| Red Hat voice | 7 | 2x | 14 |
| Audience alignment | 8 | 1x | 8 |
| Originality | 7 | 1x | 7 |
| Evidence & examples | 8 | 2x | 16 |
| Product positioning | 9 | 1x | 9 |
| Human authenticity | 7 | 2x | 14 |
| **Total** | | | **84 / 110 -> 7.6** |

## Line-Level Feedback

### Technical accuracy
- **Location**: "What is MCP Trust Plane?" section, line 12
- **Issue**: The claim of "60 filters total: 6 cross-provider 'common' filters ... and 54 provider-specific data guards" is precise, but should be verified against the actual repository. If the upstream count has changed, this becomes a factual error that undermines credibility.
- **Current**: "The project ships 60 filters total: 6 cross-provider 'common' filters ... and 54 provider-specific data guards."
- **Suggested**: Verify filter count against the repo's actual contents. If uncertain, use softer language: "The project ships dozens of filters, including 6 cross-provider 'common' filters and provider-specific data guards for major database and API platforms."

- **Location**: "Containerizing for OpenShift with UBI images" section, line 25
- **Issue**: The Dockerfile uses `ubi9/nodejs-22`, but the body text on line 22 says "Converting to Red Hat UBI9 required one structural change: the UBI Node.js image defaults to a non-root user (UID 1001)." The explanation of why `USER 0` is needed is accurate, but calling it "the OpenShift permission fix" is slightly misleading. It's really the OpenShift arbitrary-UID compatibility fix, not a permission "fix."
- **Current**: "so we needed to temporarily switch to `USER 0` for the OpenShift permission fix"
- **Suggested**: "so we switch to `USER 0` briefly to set group permissions for OpenShift's arbitrary UID assignment"

### Red Hat voice
- **Location**: "Why MCP security matters for enterprise AI" section, lines 16-18
- **Issue**: The rhetorical questions ("who validates...", "who ensures...") followed by "These questions keep security teams up at night" is a sales-pitch cadence. The Red Hat voice should be more direct; state the problem, then describe the solution.
- **Current**: "When an AI agent autonomously calls a database tool with a SQL query, who validates that the query is safe? When an agent retrieves customer records, who ensures PII doesn't leak into logs or downstream systems? These questions keep security teams up at night as agentic AI adoption accelerates."
- **Suggested**: "AI agents can autonomously call database tools with arbitrary SQL queries. They can pull customer records and pass PII to downstream systems or logs. As agentic AI adoption accelerates, these uncontrolled tool calls represent a real gap in enterprise security posture."

- **Location**: "What we learned" section, lines 81-83
- **Issue**: The bold-lead pattern ("**Zero dependencies changed everything.** ...") is used for every lesson. This creates a symmetrical paragraph structure that reads as formulaic. Vary the rhythm: lead with the insight in some, the evidence in others.
- **Current**: Four consecutive paragraphs each starting with a bolded declarative sentence.
- **Suggested**: Keep bold leads for 2 of the 4, and restructure the others. For example, start the pull-secrets paragraph with the scenario: "Our pods pulled images successfully during builds but failed at runtime in the deployment namespace. The fix was adding `imagePullSecrets` to the pod specs..."

### Audience alignment
- **Location**: "Testing the security guardrails" section, line 74
- **Issue**: The PII detection test result is vague compared to the other test results. The target audience (platform engineers, security architects) would want to see the actual filter response or at least a concrete description of what action was taken.
- **Current**: "The filter responded with its assessment of the content."
- **Suggested**: Show the actual response, e.g., `{"action": "flag", "reason": "PII detected: email address"}` or describe the specific action the filter took.

### Originality
- **Location**: General observation
- **Issue**: The post does well at sharing deployment-specific learnings (the USER 0 pattern, fail-open contract, zero-dep builds). The "What we learned" section is the strongest original content. However, sections 1-2 ("What is MCP Trust Plane?" and "Why MCP security matters") read as descriptions that could come from the project's own README. Tighten those sections and invest the word budget into more deployment-specific insights or performance observations.

### Evidence & examples
- **Location**: "Deploying the filter fleet to OpenShift" section, line 59
- **Issue**: Resource numbers (128Mi, 100m CPU, 768Mi total, 600m total) are strong concrete evidence. The Mermaid diagram is a good visual. But there's no mention of actual pod startup times, image sizes, or observed resource usage under test load. One or two runtime metrics would strengthen the section.
- **Current**: "Resource requests are minimal: 128Mi memory and 100m CPU per filter, totaling 768Mi and 600m for the full fleet."
- **Suggested**: Add observed data: "In practice, each filter pod consumed about [X]Mi at idle and [Y]Mi under test load, well within the 128Mi request."

### Human authenticity
- **Location**: Throughout
- **Issue**: Sentence length is fairly uniform (15-25 words). The post would benefit from a few short punchy sentences (5-8 words) mixed in to break the rhythm. The "What we learned" section is the best for varied sentence structure; apply that variation elsewhere.
- **Current**: "Build times averaged 30 seconds per filter on the OpenShift cluster." (followed by another sentence of similar length)
- **Suggested**: After the Dockerfile code block: "No `npm install`. No `node_modules`. The build copies two files and runs one permission command. Thirty seconds per filter."

## AI Writing Flags

### Em Dashes: 0 found
No em dashes detected. Clean.

### Formulaic Phrases: None detected
No instances of "Moreover," "Furthermore," "Additionally," "powerful," "seamless," "robust," "Let's," or other flagged patterns.

### Structural Pattern: Moderate concern
The four bold-lead paragraphs in "What we learned" create a visibly symmetrical pattern. The rhetorical-question opening in section 2 is a common AI writing trope. These are not hard failures but contribute to a slightly templated feel.

## Summary
The single most important change: rewrite the PII detection test result (line 74) with a concrete response payload like the other test scenarios, and break the symmetrical bold-lead pattern in "What we learned" by varying paragraph openings. The post is technically solid and avoids the worst AI writing patterns, but needs more sentence rhythm variation and one or two runtime metrics to move from good to excellent.
