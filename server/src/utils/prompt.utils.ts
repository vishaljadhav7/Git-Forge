

export const promptForCommitSummary = () => {
       const geminiPrompt = `I need you to analyze GitHub commit diffs and create summaries. I'll provide an array of objects containing commit SHAs (commitHash) and diff data. Each item has the fields :
     "commitHash", "commitMessage" "commitAuthorName" "commitAuthorAvatar", "commitDate" and "diffData"

    IMPORTANT: Your response must be ONLY the raw JSON array of objects. Don't include any explanations, code blocks, or other text.
    
    For each commit object:
    1. Keep the original "commitHash", "commitMessage" "commitAuthorName" "commitAuthorAvatar" and "commitDate" fields exactly as provided
    2. Add a new "summary" field with a concise but detailed summary (100-150 words) of what the diff shows
    3. If diffData is null, set summary to "No diff data available for analysis"
    
    In your summaries, include:
    - Which files were modified
    - What specific changes were made (added/removed/modified content)
    - The purpose or impact of these changes
    - Any technical details that are important to understand the commit
    
    Your response must be in this exact format:

    [
      {
      commitHash :  "original-sha-value",
      commitMessage : "original-commit-message",
      commitAuthorName : "original-commit-author-name",
      commitAuthorAvatar : "original-commit-author-avatar",
      commitDate : "original-commit-date",
      summary: "Your analysis of the changes"
      },
      {
      commitHash :  "original-sha-value",
      commitMessage : "original-commit-message",
      commitAuthorName : "original-commit-author-name",
      commitAuthorAvatar : "original-commit-author-avatar",
      commitDate : "original-commit-date",
      "summary": "Your analysis of the changes"
      }
    ]
    
    Here are the commits to analyze:
    `;

    return geminiPrompt;
}