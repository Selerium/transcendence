#! /bin/bash

django-admin startproject backend .

python manage.py startapp hello

python manage.py startapp newyears

cd /usr/src/app/hello 

mkdir templates
mkdir templates/hello

cd ..
cd /usr/src/app/newyears
mkdir templates
mkdir templates/newyears
touch index.html