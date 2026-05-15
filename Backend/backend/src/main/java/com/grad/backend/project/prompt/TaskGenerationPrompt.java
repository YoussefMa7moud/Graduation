package com.grad.backend.project.prompt;

/**
 * System prompt template for extracting structured software project tasks from a proposal.
 */
public final class TaskGenerationPrompt {

    private TaskGenerationPrompt() {}

    public static final String SYSTEM_INSTRUCTION = """
            You are a senior technical project manager specializing in software delivery.
            Your job is to read a project proposal or requirements document and produce a realistic,
            professional work breakdown for a software engineering team.

            Rules:
            - Output ONLY valid JSON. No markdown fences, no commentary, no preamble.
            - Organize work into exactly these phases (use these enum values): PLANNING, DESIGN, DEVELOPMENT, TESTING, DEPLOYMENT, MAINTENANCE.
            - Each phase must contain 3–8 actionable tasks appropriate for that phase.
            - Tasks must reflect requirements explicitly or reasonably implied in the proposal.
            - Use software-industry roles for suggestedAssignee (e.g. Product Owner, UX Designer, Backend Developer, QA Engineer, DevOps Engineer, Tech Lead).
            - priority must be one of: LOW, MEDIUM, HIGH, CRITICAL.
            - status must always be TODO for new tasks.
            - estimatedDuration must be human-readable (e.g. "2 days", "1 week", "3 hours").
            - dependencies lists titles of other tasks in this same project that must complete first; use [] when none.
            - milestone is a short phase deliverable label shared by tasks in that phase.
            - Include a brief projectSummary (1–2 sentences) at the root.
            - Prefer concrete deliverables (APIs, modules, test suites, CI/CD, documentation) over vague items.
            """;

    public static String buildUserPrompt(String projectTitle, String projectContext, String proposalText) {
        String safeTitle = projectTitle != null ? projectTitle : "Software Project";
        String safeContext = projectContext != null && !projectContext.isBlank()
                ? projectContext
                : "No additional project context provided.";

        return """
                Analyze the following project proposal and generate a structured task breakdown.

                Project title: %s

                Existing project context (guidelines / scope hints):
                %s

                --- PROPOSAL DOCUMENT START ---
                %s
                --- PROPOSAL DOCUMENT END ---

                Return JSON matching this exact schema:
                {
                  "projectSummary": "string",
                  "phases": [
                    {
                      "phase": "PLANNING|DESIGN|DEVELOPMENT|TESTING|DEPLOYMENT|MAINTENANCE",
                      "milestone": "string",
                      "tasks": [
                        {
                          "title": "string",
                          "description": "string (2-4 sentences, actionable)",
                          "priority": "LOW|MEDIUM|HIGH|CRITICAL",
                          "estimatedDuration": "string",
                          "suggestedAssignee": "string",
                          "status": "TODO",
                          "dependencies": ["optional task title"],
                          "milestone": "string"
                        }
                      ]
                    }
                  ]
                }
                """.formatted(safeTitle, safeContext, proposalText);
    }
}
