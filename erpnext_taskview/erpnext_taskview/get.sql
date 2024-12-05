WITH Projects AS (
	SELECT
		p.name AS name,
		p.project_name AS title,
		p.is_active AS is_active,
		p.status AS status,
		p.percent_complete AS percent_complete
	FROM
		`tabProject` p
	WHERE
		p.is_active = 1
),
Tasks AS (
	SELECT
		t.name AS name,
		t.project AS project,
		t.parent_task AS parent_task,
		t.task_name AS title,
		t.status AS status,
		t.percent_complete AS percent_complete,
		t.start_date AS start_date,
		t.end_date AS end_date
	FROM
		`tabTask` t
	WHERE
		t.status != 'Cancelled'
)