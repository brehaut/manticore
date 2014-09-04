"""This script is a simple program to convert data from the raw Excel spreadsheet
CSV dump into the json used by manticore

"""

import json
import csv
import sys
import collections

book_mapping = {
    #'C': "13th Age", # Core data already exists
    'B': "Bestiary",
    'TW': '13 True Ways'
}

size_mapping = {
    'normal': 'normal',
    'large': 'large',
    'huge': 'huge',
    'double-strength': 'large',
    'triple-strength': 'huge'
}

def transform(in_file, out_file):
    csv_data = csv.reader(iter(in_file))
    csv_data.next() # skip header row

    books_data = collections.defaultdict(lambda: [])

    for level, name, size, role, attr, book, page in csv_data:
        if book not in book_mapping: continue
        book = books_data[book_mapping[book]]
        book.append([name.capitalize(), int(level, 10), size_mapping[size],
                     role, attr.split("/"), int(page, 10)])

    json.dump(books_data, out_file, indent=4)


if __name__ == "__main__":
    transform(sys.stdin, sys.stdout)

