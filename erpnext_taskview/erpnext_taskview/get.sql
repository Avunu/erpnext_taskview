WITH RECURSIVE
ProjectIndexes AS (
  SELECT 
    name,
    ROW_NUMBER() OVER (ORDER BY name) - 1 AS project_idx,
    project_name,
    status
  FROM tabProject
),
TaskIndexes AS (
  SELECT
    t.name AS child_name,
    COALESCE(t.parent_task, t.project) AS parent_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(t.parent_task, t.project) 
      -- ORDER BY t.name
      ORDER BY t.creation  -- Order by creation instead of name
    ) - 1 AS seq_number
  FROM tabTask t
),
TaskTree AS (
  -- Base case: Top-level tasks under projects
  SELECT 
    t.name AS docName,
    t.subject AS text,
    t.project AS parent,
    t.project,
    t.status,
    p.project_name,
    p.project_idx,
    ti.seq_number AS task_idx,
    1 AS level,
    FALSE AS isProject,
    FALSE AS isBlank,
    "stopped" AS timerStatus,
    NULL AS timesheetDetail,
    EXISTS (
      SELECT 1
      FROM tabTask child
      WHERE child.parent_task = t.name
    ) AS expanded,
    FALSE AS autoFocus,
    CAST(CONCAT('$[', p.project_idx, '].children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask t
  JOIN ProjectIndexes p ON t.project = p.name
  JOIN TaskIndexes ti ON t.name = ti.child_name
  WHERE t.parent_task IS NULL AND t.docstatus = 0
  
  UNION ALL
  
  -- Recursive case: Nested tasks
  SELECT 
    t.name,
    t.subject,
    t.parent_task,
    t.project,
    t.status,
    tt.project_name,
    tt.project_idx,
    ti.seq_number,
    tt.level + 1,
    FALSE,
    FALSE,
    "stopped",
    NULL,
    EXISTS (
      SELECT 1
      FROM tabTask child
      WHERE child.parent_task = t.name
    ) AS expanded,
    FALSE as autoFocus,
    CAST(CONCAT(tt.json_path, '.children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask t
  JOIN TaskTree tt ON t.parent_task = tt.docName
  JOIN TaskIndexes ti ON t.name = ti.child_name
  WHERE t.docstatus = 0
),
projects AS (
  -- Projects list with sequential indices
  SELECT 
    name AS docName,
    CONCAT(name, ': ', project_name) AS text,
    NULL AS parent,
    name AS project,
    status, -- Include status here
    project_idx,
    TRUE AS isProject,
    FALSE AS isBlank,
    NULL AS timerStatus,
    NULL AS timesheetDetail,
    FALSE AS expanded,
    CAST(CONCAT('$[', project_idx, ']') AS VARCHAR(1000)) AS json_path
  FROM ProjectIndexes
)
SELECT json_data, json_path FROM (
  -- Combine projects and tasks
  SELECT 
  -- Projects
    JSON_OBJECT(
      'docName', docName,
      'text', text,
      'parent', parent,
      'project', project,
      'status', status, -- Include status in output
      'isProject', TRUE,
      'isBlank', isBlank,
      'timerStatus', timerStatus,
      'timesheetDetail', timesheetDetail,
      'expanded', expanded,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ) AS json_data,
    json_path
  FROM projects
  WHERE isBlank = FALSE  -- Exclude blank projects

  UNION ALL
  
  SELECT 
  -- Tasks
    JSON_OBJECT(
      'docName', docName,
      'text', text,
      'parent', parent,
      'project', project,
      'status', status, -- Include status in output
      'isProject', FALSE,
      'isBlank', isBlank,
      'timerStatus', timerStatus,
      'timesheetDetail', timesheetDetail,
      'expanded', expanded,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ) AS json_data,
    json_path
  FROM TaskTree
  WHERE isBlank = FALSE  -- Exclude blank tasks
) combined
ORDER BY json_path;
