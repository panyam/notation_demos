# notation_demos
Sample content for notations as a backup.

Every song here renders on the notations docs site, at https://panyam.github.io/notations/library/.
The site builds from the commit pinned in notations' `docs/library.json`, so a new or renamed song
shows up there once notations runs `pnpm run library --bump`.

The first line of each song links to its page. The URL comes from the file path, so after adding or
renaming a song, run:

```bash
node scripts/links.mjs --fix
```

CI runs `node scripts/links.mjs --check` and fails if a link is missing or out of date. Songs under
`v3/` and `tests/` aren't in the library and get no link.
