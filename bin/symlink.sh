#!/bin/bash
FOLDER="$( cd "$( dirname "$0" )" && cd .. && pwd )"
PACKAGES="$( cd && pwd )/.config/sublime-text-3/Packages"

(
  cd $PACKAGES
  ln -s $FOLDER
)
