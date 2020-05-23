#!/bin/bash -xe

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

nearleyc bstruct.ne -o bstruct.js
nearley-railroad bstruct.ne -o bstruct.html
# nearley-unparse -n 3 bstruct.js
# nearley-test bstruct.js < example.bstruct