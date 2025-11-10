import type { Template } from '@/src/types';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start with a clean slate',
    category: 'other',
    content: '',
  },
  {
    id: 'blog-post',
    name: 'Blog Post',
    description: 'Template for writing blog posts',
    category: 'blog',
    content: `# Blog Post Title

**By [Your Name]** | *[X] min read*

---

## Introduction

Start your blog post with an engaging introduction that hooks the reader.

## Main Content

### Section 1

Write your main content here.

### Section 2

Continue with more sections as needed.

## Conclusion

Wrap up your post with a strong conclusion.

---

*Tags: [tag1, tag2, tag3]*
`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Template for taking meeting notes',
    category: 'meeting',
    content: `# Meeting Notes

**Date:** [Date]  
**Time:** [Time]  
**Attendees:** [List attendees]

---

## Agenda

1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion

### Topic 1

[Notes on topic 1]

### Topic 2

[Notes on topic 2]

## Action Items

- [ ] [Action item 1] - [Assignee] - [Due date]
- [ ] [Action item 2] - [Assignee] - [Due date]
- [ ] [Action item 3] - [Assignee] - [Due date]

## Next Steps

[Summary of next steps]

---
`,
  },
  {
    id: 'project-report',
    name: 'Project Report',
    description: 'Template for project status reports',
    category: 'report',
    content: `# Project Report: [Project Name]

**Date:** [Date]  
**Project Manager:** [Name]  
**Status:** [In Progress / Completed / On Hold]

---

## Executive Summary

[Brief overview of project status]

## Progress Update

### Completed This Week

- [Completed item 1]
- [Completed item 2]

### In Progress

- [In progress item 1]
- [In progress item 2]

### Blockers

- [Blocker 1]
- [Blocker 2]

## Metrics

- **Completion:** [X]%
- **Budget:** [Status]
- **Timeline:** [Status]

## Next Steps

1. [Next step 1]
2. [Next step 2]

---
`,
  },
  {
    id: 'daily-notes',
    name: 'Daily Notes',
    description: 'Template for daily journaling',
    category: 'personal',
    content: `# Daily Notes - [Date]

## Today's Goals

- [ ] [Goal 1]
- [ ] [Goal 2]
- [ ] [Goal 3]

## Notes

[Your notes for the day]

## Reflections

[What went well, what could be improved]

## Tomorrow's Focus

[What to focus on tomorrow]

---
`,
  },
  {
    id: 'readme',
    name: 'README',
    description: 'Template for project README files',
    category: 'other',
    content: `# Project Name

Brief description of your project.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
# Installation instructions
\`\`\`

## Usage

\`\`\`bash
# Usage examples
\`\`\`

## Contributing

[Contributing guidelines]

## License

[License information]

---
`,
  },
];
