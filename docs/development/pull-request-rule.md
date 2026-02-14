# Pull Request Rule Wiki

## Overview
A Pull Request (PR) is a crucial process for reviewing code changes and ensuring quality. This page defines PR rules to establish a unified development workflow for the project.

## Draft Rules
### 1. Creating a PR
- The PR title should concisely describe the changes.
- If possible, review the PR using `ChatGPT` or `dodoAI` and include the review log URL in the PR.
- PR content template:
  ```
  # Overview
  
  # AI Review Log
  
  # Screenshots (for frontend development)
  
  # Execution Results (for backend development)
  ```
### 2. Code Review
- Assign at least one reviewer.
- Do not merge until all review comments are resolved.

### 3. Linking Issues
- Use GitHub's `Linked issues` feature when creating a PR to link relevant issues.

### 4. Merge Rules
- A PR can be merged once it has been approved.
- Do not merge if automated tests fail.

## Set PR template to Github Repository
To set a default PR template in your GitHub repository, follow these steps:

1. **Create the File**:  
   Create a file `** .github/PULL_REQUEST_TEMPLATE.md **` in your repository.

2. **Add the Template Content**:  
   Add the following content to `/ULL_REQUEST_TEMPLATE.md`:
```
# Overview

# AI Review Log

# Screenshots (for frontend development)

# Execution Results (for backend development)
```
3. Push the Changes:
After creating and editing the .github/PULL_REQUEST_TEMPLATE.md file, push it to your GitHub repository.

Once you complete these steps, when creating a new pull request, the default PR template will appear, prompting users to fill in the necessary details for better tracking and reporting.