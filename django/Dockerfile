# pull official base image
FROM python:3.11


# set work directory
WORKDIR /code

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y libpq-dev
# install dependencies
RUN pip install --upgrade pip

COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy project
COPY . /code/
EXPOSE 8000

COPY entry_point.sh /code/
RUN chmod a+x ./entry_point.sh
CMD [ "./entry_point.sh"]

# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# RUN testing.sh