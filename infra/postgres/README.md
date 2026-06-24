docker exec -it postgres psql -U postgres -d postgres

docker exec -it postgres bash

# UNIX socket
psql -U postgres -d postgres

# TCP socket
psql -h localhost -p 5432 -U idenity_user -d identity 

# Show all databases in postrges
\l 

# Show all users
\du

# Show all tables
\dt
