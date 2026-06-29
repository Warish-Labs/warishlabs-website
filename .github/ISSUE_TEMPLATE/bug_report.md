name: Bug Report
description: Create a report to help us improve and fix issues.
labels: [bug]
body:
  - type: markdown
    attributes:
      value: |
        Thank you for reporting this issue! Please provide as much detail as possible to help us reproduce and resolve the bug.
  - type: textarea
    id: description
    attributes:
      label: Bug Description
      description: A clear and concise description of what the bug is.
      placeholder: Describe what happened...
    validations:
      required: true
  - type: textarea
    id: reproduction
    attributes:
      label: Steps to Reproduce
      description: Steps to reproduce the behavior.
      placeholder: |
        1. Go to '...'
        2. Click on '...'
        3. Scroll down to '...'
        4. See error '...'
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected Behavior
      description: A clear and concise description of what you expected to happen.
      placeholder: Explain what should have happened...
    validations:
      required: true
  - type: textarea
    id: environment
    attributes:
      label: Environment Info
      description: OS version, Node.js version, browser details, etc.
      placeholder: |
        - Browser: Chrome 124
        - OS: Windows 11 / Ubuntu 22.04
        - Node version: v22.0.0
    validations:
      required: false
  - type: textarea
    id: logs
    attributes:
      label: Log Outputs / Screenshots
      description: Paste stack traces or describe screenshots attached.
      placeholder: Console errors or terminal logs...
    validations:
      required: false
