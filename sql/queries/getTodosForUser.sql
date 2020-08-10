SELECT t.id, title, day, month, year, completed, description
FROM todos t
JOIN users u ON t.user_id = u.id
WHERE u.username = $1;