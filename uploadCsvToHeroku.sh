# You have your csv data and it looks like so... It's in a file named "my_data.csv" and we want to import it into a table named "my_things".

# "1", "Something", "0.50", "2013-05-05 10:00:00"
# "2", "Another thing", "1.50", "2013-06-05 10:30:00"

# Now you want to import it, go to the command line and type:

PGPASSWORD=5aa4131ad9e7bd50d7288f3656d0f2b321f8acfb60f0cc2ea2d8ef4c96f3f492 psql -h ec2-54-197-254-117.compute-1.amazonaws.com -U ymbwfehndylibj dou82am7shb4v -c "\copy receta FROM 'recetas.csv' WITH CSV;"

# Voila! It's impoted. Now if you want to wipe it out and import a fresh one, you would do this:

# $ heroku pg:psql
# $ TRUNCATE table my_things;

# Now re-do the PGPASSWORD command above:

# $ PGPASSWORD=PWHERE psql -h HOSTHERE -U USERHERE DBNAMEHERE -c "\copy my_things FROM 'my_data.csv' WITH CSV;"