UPDATE todos
SET title = $1,
    day = $2,
    month = $3,
    year = $4,
    completed = $5,
    description = $6
WHERE id = $7;