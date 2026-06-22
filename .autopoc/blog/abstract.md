# Blog Abstract

## Thesis
Deploying MCP Trust Plane's security filter microservices on OpenShift proves that zero-dependency Node.js guardrails can protect AI agent tool calls with minimal operational overhead.

## Target Audience
Platform engineers, security architects, and MLOps teams deploying AI agents on Kubernetes/OpenShift.

## Blog Type
Red Hat Developer Blog

## Key Points
1. MCP Trust Plane's filter-as-microservice architecture maps perfectly to Kubernetes: each filter is a stateless, independently scalable pod with built-in health checks.
2. Zero external dependencies mean zero supply-chain risk, sub-minute builds, and trivial containerization with UBI base images.
3. The fail-open design ensures agent workflows continue even when filters encounter unexpected inputs.

## Products/Projects
Red Hat OpenShift AI, Open Data Hub, Model Context Protocol (MCP)

## CTA
Try deploying MCP Trust Plane on your own OpenShift cluster to add security guardrails to your AI agent infrastructure.

## Proposed Outline
1. What is MCP Trust Plane?
2. Why MCP security matters for enterprise AI
3. Containerizing for OpenShift with UBI images
4. Deploying the filter fleet to OpenShift
5. Testing the security guardrails
6. What we learned
7. Try it yourself
