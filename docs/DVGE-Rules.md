# EMBER MOTION STUDIO v5.9.0

## MASTER RULES FOR AI ASSISTANTS

1. ARCHITECTURE:
   - Use Vanilla JS/HTML/CSS only.
   - Access DOM via ctx.root.getElementById (Shadow DOM).
   - Use the official 5-step workflow: Config -> Artifacts -> Context -> Refine -> Export.

2. PROTOCOL:
   - Use window.renderDVGE = (frame, props, ctx) => { ... }.
   - Everything must be deterministic (frame-based).
   - Always reference assets via ctx.props.

3. UTILS:
   - Use ctx.utils.lerp, ctx.utils.spring, ctx.utils.clamp.
   - Use dynamic fields defined with /* @dv-field */ comments.

(File updated automatically on 04/05/2026 for v5.9.0 Release)
