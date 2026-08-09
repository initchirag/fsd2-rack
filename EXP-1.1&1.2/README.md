# Experiment 1.1.1 + Draft Management App

This React project implements:

1. A multi-platform post composer with real-time validation based on platform constraints.
2. A frontend draft management system (create, edit, update, delete) with optional mock API delay.

## Features

- Platform-aware validation:
  - Character limits
  - Hashtag limits
  - Media count checks
  - Platform-specific requirements
- Dynamic UI feedback for warning/error states
- Draft CRUD workflow
- localStorage persistence for saved drafts
- Optional simulated backend latency for async behavior practice

## Run

```bash
npm install
npm run dev
```

## Validation commands

```bash
npm run lint
npm run build
```
