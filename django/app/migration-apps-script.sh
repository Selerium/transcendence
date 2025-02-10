echo "Making migrations for Django/Postgres"
python3 manage.py makemigrations users
python3 manage.py makemigrations friends
python3 manage.py makemigrations achievements
python3 manage.py makemigrations msgs
echo "Migrating..."
python3 manage.py migrate
echo "Loading dummy data..."
python3 manage.py loaddata achievements
echo "Task complete!"