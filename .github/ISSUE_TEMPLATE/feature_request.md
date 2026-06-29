name: Feature Request
description: Propose a new idea, feature, or enhancement for the project.
labels: [enhancement]
body:
  - type: markdown
    attributes:
      value: |
        We are always looking to improve our laboratory assets and SaaS tools. Share your ideas with us!
  - type: textarea
    id: problem
    attributes:
      label: Is your feature request related to a problem?
      description: A clear and concise description of what the problem is.
      placeholder: E.g., I'm frustrated when I try to...
    validations:
      required: true
  - type: textarea
    id: solution
    attributes:
      label: Describe the solution you'd like
      description: A clear and concise description of what you want to happen.
      placeholder: Describe your desired feature...
    validations:
      required: true
  - type: textarea
    id: alternatives
    attributes:
      label: Describe alternatives you've considered
      description: A clear and concise description of any alternative solutions or features you've considered.
      placeholder: List any alternatives...
    validations:
      required: false
  - type: textarea
    id: context
    attributes:
      label: Additional Context
      description: Add any other context or screenshots about the feature request here.
      placeholder: Any other info...
    validations:
      required: false
