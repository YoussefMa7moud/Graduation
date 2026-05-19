package com.grad.backend.project.prompt;

/**
 * Prompts for AI-generated project summary (SRS/SDD workspace).
 */
public final class GuidelinesGenerationPrompt {

    private GuidelinesGenerationPrompt() {}

    public static final String SYSTEM_INSTRUCTION = """
            You are a senior software architect and technical project manager.
            You summarize software projects for project managers who will author SRS/SDD documents
            aligned with contract obligations and OCL constraints.

            Rules:
            - Output ONLY valid JSON. No markdown code fences, no commentary outside JSON.
            - projectSummary: 2–4 paragraphs in Markdown describing scope, objectives, stakeholders,
              key deliverables, timeline considerations, success criteria, and how contract OCL
              constraints shape the work.
            - Be specific to the project data provided; do not use generic filler.
            - If OCL rules are missing, still summarize based on proposal and contract context.
            - Use professional tone suitable for enterprise software delivery.
            """;

    public static String buildUserPrompt(
            String projectTitle,
            String projectDescription,
            String mainFeatures,
            String projectType,
            Integer durationDays,
            Object budgetUsd,
            String clientName,
            String contractName,
            String oclRules,
            String existingGuidelines) {

        return """
                Generate a project summary for technical documentation (SRS/SDD).

                Project title: %s
                Project type: %s
                Client: %s
                Contract: %s
                Duration (days): %s
                Budget (USD): %s

                Project description:
                %s

                Main features:
                %s

                OCL constraints (contract policy rules):
                %s

                Existing summary (if any — improve and expand, do not repeat verbatim):
                %s

                Return JSON with exactly this shape:
                {
                  "projectSummary": "markdown string"
                }
                """.formatted(
                nullTo(projectTitle, "Software Project"),
                nullTo(projectType, "Not specified"),
                nullTo(clientName, "Not specified"),
                nullTo(contractName, "Main contract"),
                durationDays != null ? durationDays.toString() : "Not specified",
                budgetUsd != null ? budgetUsd.toString() : "Not specified",
                nullTo(projectDescription, "No description provided."),
                nullTo(mainFeatures, "Not specified."),
                nullTo(oclRules, "No OCL rules provided yet."),
                nullTo(existingGuidelines, "None (generate fresh).")
        );
    }

    private static String nullTo(String value, String fallback) {
        return value != null && !value.isBlank() ? value : fallback;
    }
}
