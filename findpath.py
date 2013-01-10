#!/usr/bin/env python
import optparse
import os
import re

def main():
    p = optparse.OptionParser()
    options, arguments = p.parse_args()
    package_root = arguments[0]
    mod = __import__(package_root)
    mod_path = mod.__file__
    package_folder_re = re.compile(
        r'[/\\]__init__\.py[co]?$', re.IGNORECASE)
    python_file_re = re.compile(
        r'[a-z_]+\.py[co]?', re.IGNORECASE)
    if package_folder_re.search(mod_path):
        print os.path.dirname(mod_path)
        exit(0)
    elif python_file_re.search(mod_path):
        print mod_path.rstrip('co')
    exit(1)

if __name__ == '__main__':
    main()
