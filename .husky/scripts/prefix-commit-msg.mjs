#!/bin/sh node

import { $ } from 'zx'

const COMMIT_EDITMSG_PATH = process.argv[2]
const BRANCH_NAME = (await $`git rev-parse --abbrev-ref HEAD`).stdout.trim()

const scopes = [
  ...new Set(
    (await $`git diff --name-only --cached`).stdout
      .split('\n')
      .filter(Boolean)
      .map(
        path => (
          (path = path.split('/')), path[0] !== 'packages' ? 'root' : path[1]
        )
      )
  ),
]

if (BRANCH_NAME !== 'HEAD') {
  const prefix = `[${BRANCH_NAME}:${scopes.join(',')}]`

  // Replace commit message with prefixed one
  const replace = `1s~^~${prefix} ~`
  await $`sed -i.bak -e ${replace} ${COMMIT_EDITMSG_PATH}`
}
