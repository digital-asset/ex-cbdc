#! /usr/bin/env bash
set -euo pipefail

yamls=( $(find . -mindepth 2 -name 'daml.yaml') )
names=( $(yq -r '.name + "-" + .version + ".dar," + .build_codegen' ${yamls[@]}) )
projects=( ${yamls[@]%/*} )

for((i=0;i<${#yamls[@]};i++)); do
    echo "${projects[i]}/.daml/dist/${names[i]}"
done \
  | sort
