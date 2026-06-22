# Image Review -- v1

## Scores

| Dimension | Weight | Score (1-10) | Weighted |
|---|---|---|---|
| Placement rationale | 2x | 4 | 8 |
| Prompt specificity | 2x | 2 | 4 |
| Brand compliance | 2x | 7 | 14 |
| Aspect ratio & sizing | 1x | 3 | 3 |
| Alt text quality | 1x | 1 | 1 |
| Image count | 1x | 3 | 3 |
| **Totals** | | | **33 / 90** |

**Normalized score: 3.7 / 10**

---

## Existing Visuals

### Mermaid Diagram: Filter Fleet Architecture (lines 45-57)

**Strengths:**
- The `%%{init}%%` theme block is present and uses correct Red Hat brand variables (`primaryColor: '#EE0000'`, `primaryBorderColor: '#A30000'`, `secondaryColor: '#F0F0F0'`, `tertiaryColor: '#0066CC'`). Good brand compliance.
- The `graph LR` type is a reasonable choice for showing the fan-out from an MCP Agent to six filters.
- Labels include port numbers, which is useful technical detail.

**Issues:**
- The fan-out syntax `Agent --> SG & PR & RL & SV & RT & FM` creates a starburst with six edges from a single node. This renders as a wide, flat graph that is hard to read at typical blog column widths. A `graph TD` with a subgraph row, or a two-column layout, would be more readable.
- The diagram is placed well (in the "Deploying the filter fleet" section where it directly aids comprehension), but it is the *only* visual in the entire post.
- No alt text or caption is provided for the Mermaid diagram.

---

## Missing Image Opportunities

The post has **six** distinct sections that would benefit from visuals. Currently only one has any:

1. **Hero image (missing).** A 16:9 banner showing the concept of security filters guarding AI agent traffic would set the visual tone. Prompt suggestion: *"Minimalist technical illustration, 16:9, showing an AI agent icon on the left sending tool-call arrows through a row of shield/filter icons (labeled SQL guard, PII redactor, etc.) before reaching database and API tool icons on the right. Red Hat color palette: #EE0000 shields, #151515 background, #F0F0F0 text, #0066CC accent arrows. Clean line art, no gradients."*

2. **Architecture overview (section 1, "What is MCP Trust Plane?", missing).** A Mermaid sequence diagram or flowchart showing the request flow: `Agent -> MCP Client -> Filter Chain -> MCP Server -> Tool` would ground the reader immediately. This is highly diagrammable content.

   Suggested Mermaid:
   ```
   sequenceDiagram
       participant Agent
       participant FilterChain as Filter Chain
       participant Tool as MCP Tool
       Agent->>FilterChain: tool_call(args)
       FilterChain->>FilterChain: inspect / allow / block / modify
       FilterChain->>Tool: forwarded call
       Tool-->>FilterChain: response
       FilterChain-->>Agent: filtered response
   ```

3. **UBI containerization (section 3, missing).** The Dockerfile code block is good, but a before/after comparison diagram (Alpine vs. UBI image layers, the USER 0 sandwich pattern) would reinforce the key learning. A simple Mermaid flowchart showing the build stages would work.

4. **Test results (section 5, missing).** A results summary table or a pass/fail visual (even a simple Mermaid pie chart or a styled table) would make the "5/5 scenarios passed" result more visually impactful. Currently the results are buried in prose paragraphs.

5. **Lessons learned (section 6, missing).** A callout box or visual summary of the four key takeaways would break up the wall of text and improve scannability.

6. **"Try it yourself" (section 7, missing).** A terminal screenshot placeholder or styled code walkthrough visual showing the 3-step deployment would make the CTA more inviting.

---

## Per-Dimension Feedback

### Placement rationale (4/10, weight 2x)
The single Mermaid diagram is well-placed in the deployment section where it directly supports comprehension. However, five other sections that would clearly benefit from visuals have none. The post reads as a wall of text with one diagram island. For a Red Hat Developer Blog targeting platform engineers, visual storytelling is essential for engagement.

### Prompt specificity (2/10, weight 2x)
There are no image placeholders with generation prompts anywhere in the draft. The Mermaid diagram doesn't need a generation prompt (it's inline code), but the post needs at minimum a hero image and an architecture overview, both of which require specific prompts. Score reflects the complete absence.

### Brand compliance (7/10, weight 2x)
The existing Mermaid diagram correctly uses Red Hat brand hex codes (`#EE0000`, `#A30000`, `#F0F0F0`, `#0066CC`). This is good. However, since there are no other images, there's nothing else to evaluate. The score reflects good compliance on the one visual that exists, penalized for the lack of other visuals where compliance could be demonstrated.

### Aspect ratio & sizing (3/10, weight 1x)
No aspect ratios are specified anywhere. The Mermaid diagram will auto-size, which is acceptable for Mermaid (per rubric: "Do NOT penalize for missing aspect ratios"), but any added image placeholders will need explicit ratio guidance (hero: 16:9, inline: 4:3). Score reflects the absence of any specification.

### Alt text quality (1/10, weight 1x)
No alt text exists for the Mermaid diagram or any other element. The Mermaid diagram has no surrounding description that screen readers could use. At minimum, add a caption like: *"Diagram: Six MCP Trust Plane filters deployed as independent services in the poc-mcp-trust-plane namespace, each receiving POST /filter requests from the MCP Agent."*

### Image count (3/10, weight 1x)
One visual (the Mermaid diagram) for a ~900-word technical blog post. The rubric says "10 or fewer, each earns its place" for a score of 10, but 1 image is far too few for a post of this length and complexity. A target of 3-4 visuals (hero + architecture diagram + deployment diagram + test results) would be appropriate.

---

## Summary

The draft has a single well-placed Mermaid diagram with correct Red Hat theming, but it is severely under-illustrated for a developer blog post. The lack of a hero image, architecture overview, and test results visual means readers face continuous prose with only one visual break. The most critical additions are:

1. **Add a hero image placeholder** with a detailed generation prompt and 16:9 aspect ratio.
2. **Add a Mermaid sequence diagram** in section 1 showing the MCP filter chain request flow.
3. **Add a test results table or visual** in section 5 to make the pass/fail outcomes scannable.
4. **Add alt text / captions** to the existing Mermaid diagram and all new visuals.

Addressing these four items would likely raise the score to 7-8/10.
