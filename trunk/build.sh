#!/bin/sh
APP_NAME=phplangeditor
# building
mkdir build
mkdir build/chrome
# todo ignore CVS, SVN files and repositories
zip -rq build/chrome/$APP_NAME.jar chrome/*
cp install.* build
zip -rq $APP_NAME.xpi build/*
rm -rf build
