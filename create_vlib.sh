#!/bin/bash



# Make the vlib folder if it does not exist
export vlib="vlib"
test -d $vlib || mkdir $vlib

# FIXME: Virtualenv check may not be necessary anymore as we are just looking
# for package's path anywhere in the sys.path list now
#
# Check we are in a virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Please load your virtual environment first"
    exit 1
fi

export VLIB_FILE='vlib_requirements.txt'
if [ ! -e $VLIB_FILE ]; then
    echo "$VLIB_FILE does not exist"
    exit 1
fi

for lib_name in $(cat vlib_requirements.txt); do
    if [ ! -h "$vlib/$lib_name" ]; then
        export module_path=`./findpath.py $lib_name`
        echo "Creating new symbolic link @ "$module_path" ..."
        if [ -d $module_path ]; then
            ln -s "$module_path" "$vlib/$lib_name"
        else
            ln -s "$module_path" "$vlib/$lib_name.py"
        fi
    fi
done
