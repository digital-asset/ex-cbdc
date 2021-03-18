#!/usr/bin/env python3
#
# Copyright (c) 2021, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
# SPDX-License-Identifier: Apache-2.0
#


from textops import *
import re


# example line to parse into (package, module, template) triple:
#   templateId: '85d4762ff89f3794a519cc25d0903a43e0f1a8e5912998bbd16dc9d36f43fe14:Model:SampleTemplate1',
def parse_templates(lines):
    return [m.group(1, 2, 3)
            for line in lines
            for m in [re.search(r'templateId: \'(.*):(.*):(.*)\'', line)] if m]


def print_all_model_templates(js_codegen_dir):
    template_lines = js_codegen_dir | find('*.js') | cat() | grep('templateId:')
    all_templates = parse_templates(template_lines)
    filtered_template_names = [name for pkg, mod, name in all_templates if not mod.startswith('DA.Reset')]
    for i in sorted(filtered_template_names):
        print(i)


if len(sys.argv) < 2:
    print("Usage: {} js_codegen_dir".format(sys.argv[0]), file=sys.stderr)
    exit(1)
js_codegen_dir = sys.argv[1]

print_all_model_templates(js_codegen_dir)
