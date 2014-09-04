"""Another scrappy script to reformate the json to nicely readable after csv_to_json
"""

import re
import sys

find_pattern = re.compile(r"^\s+\[\s*?\n[^\[]+?\[[^\]]*?\][^\]]*?\],?\s*$",
                          re.MULTILINE)
replace_pattern = re.compile(r"\n\s*")                             


def reformat(in_file, out_file):
    text = in_file.read()
    out_file.write(find_pattern.sub(lambda record: replace_pattern.sub("", record.group(0)), text))


if __name__ == "__main__":
    reformat(sys.stdin, sys.stdout)
