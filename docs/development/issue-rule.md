# How to create issue

## Overview  
This page defines the rules and template for creating GitHub Issues.  
Using a standardized format ensures efficient task management.  

## Rules  
- **Use the template**  
  The issue body must follow the designated template.  

- **Write the title concisely in English**  
  Example: `Create User Management Controller/Service/Model Dev & UnitTest`  

- **Provide an overview**  
  The "## Overview" section should briefly describe the purpose and background of the issue.  

- **Create a task list**  
  The "## TaskList" section should list specific work items using a checklist format.  

- **Include relevant documents**  
  The "## References" section should provide paths to related specifications and documentation.  

- **Add supplementary notes**  
  The "## Notes" section should include important details or additional information.  

- **Use AI to generate the issue body**  
  When creating an issue, utilize AI tools such as ChatGPT to generate the issue body based on the template.  

## issue body Template
```
## Overview

## TaskList
- [ ] 
- [ ] 
- [ ] 

## References

## Notes

```

## ChatGPT prompt example
### Input
```
Please create issue body using template.
Create User Management Controller/Service/Model Dev & UnitTest

openapi yaml path is /docs/users/user.yaml
api spec path is /docs/users/apispec.md

## Overview

## TaskList
- [ ] 
- [ ] 
- [ ] 

## References

## Notes

```

### Output
```
## Overview
Implement the User Management Controller, Service, and Model, along with unit tests.

## TaskList
- [ ] Implement User Management Controller  
- [ ] Implement User Management Service  
- [ ] Implement User Management Model  
- [ ] Create unit tests for each component  
- [ ] Implement and verify endpoints based on API specifications  

## References
- OpenAPI definition: `/docs/users/user.yaml`  
- API specification: `/docs/users/apispec.md`  

## Notes
- Review the API specifications before implementation and make adjustments if necessary.  
- Utilize LLM to generate code and conduct reviews.  
- If any questions arise during development, create an issue for clarification.  
```

### Set issue template to Github Repository

To set a default issue template in your GitHub repository, follow these steps:

1. **Create the File**:  
   Create a file `**.github/ISSUE_TEMPLATE/default-issue-template.md**` in your repository.

2. **Add the Template Content**:  
   Add the following content to `default-issue-template.md`:

```

---
name: Default issue template
about: Default issue template
title: ''
labels: ''
assignees: ''
---

## Overview

## TaskList
- [ ] 
- [ ] 
- [ ] 

## References

## Notes
```
3. Push the Changes:
Push this file to your GitHub repository.
Once you complete these steps, when creating a new issue, the default template will appear, prompting users to fill in the necessary details for better tracking and reporting.