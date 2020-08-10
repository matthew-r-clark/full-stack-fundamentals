INSERT INTO todos (user_id, title, day, month, year, description)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;