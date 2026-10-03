# UI workspace comparison — 2026-10-02

Historical comparison of the earlier ZIP/workspace. Superseded by the subsequently supplied newer RAR, now integrated as documented in [FRIEND-UI-UPGRADE.md](FRIEND-UI-UPGRADE.md).

Checked the supplied Downloads workspace and the ZIP with the same base name.

- The supplied workspace contains a folder reference only. Its original path, `C:/Users/ASUS/Downloads/aurafarming---สแกนและดูแลพืชสไตล์พิกเซิล`, does not exist on this computer.
- The nearby ZIP has the original nine-screen React prototype, with demo state, fixed scan candidates and no Supabase services. Archive timestamps are 2026-09-30. It is a design reference, not the integrated working version.
- Compared every archive source/configuration file against the current project. Navigation, main.tsx, index.html, metadata and sound effects are identical after normalizing line endings. The existing screen styling is retained; component changes support real data, async saves, camera/gallery and empty/error states.
- Keep the current integrated source in `C:/Users/tarit/OneDrive/Desktop/aurafarming`. Replacing it wholesale with the ZIP would restore demo behavior and remove the service integration.
- The supplied workspace now points at the current project. A portable `aurafarming.code-workspace` in the project points to `.`.
- Supabase remains project `vbxyswkoinqpdzcqltfv`, using the existing configuration, schema, Storage policies and analyze-plant Edge Function. This comparison makes no backend changes.

The timestamp establishes archive provenance only; it cannot establish whether another newer UI exists elsewhere. No newer source is contained in the supplied workspace file.
