---
type: project
schema_version: 2
updated: 2026-08-20
---

# Pipe Wall Calculator

## What it is
A single-page internal web tool that answers one question: for a given pipe size and design condition, what schedule do I specify? It computes the minimum wall thickness required under ASME B31.3 para. 304.1.2, then lists the EnerCorp permitted schedules for that size and highlights the lightest one that satisfies the requirement.

It replaces the manual step where an engineer runs the line-list formula by hand to answer a one-off question. It does **not** replace the line list, which remains the calculation of record.

## Who it's for
EnerCorp engineers doing one-off pipe schedule checks. Internal use only.

## Why
The question comes up constantly and the answer currently requires either running the formula by hand or waiting on the line list. Both are slow for what is a bounded, repeatable calculation. The tool makes the screening answer immediate while keeping the authoritative calculation where it belongs.

## Scope
Pressure design thickness for straight pipe under internal pressure, plus corrosion allowance and mill tolerance, resolved to a permitted schedule. Inputs: pipe size, design pressure, design temperature, material, corrosion allowance, joint efficiency, mill tolerance. Output: minimum wall required, and the permitted schedule ladder with the winning row highlighted.

## Not building
Each of the following was considered during specification and rejected. Reversing any of them is a conscious decision, not a refactor side effect.

**Out of engineering scope:** branch reinforcement (304.3), external pressure and vacuum, thermal expansion and support loading, fatigue, Category M and severe cyclic service, flange and fitting ratings, MDMT.

**Out of product scope:** multi-line batch processing, cost output, saved sessions, user accounts.

**Rejected interaction models:** a single-answer output instead of the ladder (hides the options an engineer needs to see); a verification mode that checks a proposed wall instead of selecting one (that is what the line list does); an interpretation layer stating verdicts in prose, or comparing pipe capacity against flange rating (noise, or answering a different question).

