WITH RECURSIVE
ProjectIndexes AS (
  SELECT 
    name,
    ROW_NUMBER() OVER (ORDER BY name) - 1 AS project_idx,
    project_name
  FROM tabProject
),
TaskIndexes AS (
  SELECT
    t.name AS child_name,
    COALESCE(t.parent_task, t.project) AS parent_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(t.parent_task, t.project) 
      ORDER BY t.name
    ) - 1 AS seq_number
  FROM tabTask t
),
TaskTree AS (
  -- Base case: Top-level tasks under projects
  SELECT 
    t.name AS docName,
    t.subject AS text,
    t.parent_task AS parent,
    t.project,
    p.project_name,
    p.project_idx,
    ti.seq_number AS task_idx,
    1 AS level,
    FALSE AS isProject,
    FALSE AS isBlank,
    TRUE AS expanded,
    FALSE AS autoFocus,
    CAST(CONCAT('$[', p.project_idx, '].children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask t
  JOIN ProjectIndexes p ON t.project = p.name
  JOIN TaskIndexes ti ON t.name = ti.child_name
  WHERE t.parent_task IS NULL
  
  UNION ALL
  
  -- Recursive case: Nested tasks
  SELECT 
    t.name,
    t.subject,
    t.parent_task,
    t.project,
    tt.project_name,
    tt.project_idx,
    ti.seq_number,
    tt.level + 1,
    FALSE,
    FALSE,
    TRUE,
    FALSE,
    CAST(CONCAT(tt.json_path, '.children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask t
  JOIN TaskTree tt ON t.parent_task = tt.docName
  JOIN TaskIndexes ti ON t.name = ti.child_name
  
  UNION ALL
  
  -- Add a blank task at the end of each task list
  SELECT
    CONCAT('BlankTask_', tt.docName) AS docName,
    'Add Task' AS text,
    tt.docName AS parent,
    tt.project,
    tt.project_name,
    tt.project_idx,
    (SELECT COALESCE(MAX(ti.seq_number), -1) + 1 
     FROM TaskIndexes ti 
     WHERE ti.parent_name = tt.docName) AS task_idx,
    tt.level + 1,
    FALSE AS isProject,
    TRUE AS isBlank,
    TRUE AS expanded,
    FALSE AS autoFocus,
    CAST(CONCAT(tt.json_path, '.children[', 
                (SELECT COALESCE(MAX(ti.seq_number), -1) + 1 
                 FROM TaskIndexes ti 
                 WHERE ti.parent_name = tt.docName), 
                ']') AS VARCHAR(1000)) AS json_path
  FROM TaskTree tt
  WHERE NOT tt.isBlank -- Avoid adding blank tasks to blank tasks
),
projects AS (
  -- Projects list with sequential indices
  SELECT 
    name AS docName,
    CONCAT(name, ': ', project_name) AS text,
    NULL AS parent,
    NULL AS project,
    project_idx,
    FALSE AS isBlank,
    CAST(CONCAT('$[', project_idx, ']') AS VARCHAR(1000)) AS json_path
  FROM ProjectIndexes

  UNION ALL

  -- Add a blank project if no projects exist
  SELECT 
    'BlankProject' AS docName,
    'Add Project' AS text,
    NULL AS parent,
    NULL AS project,
    (SELECT COALESCE(MAX(project_idx), -1) + 1 FROM ProjectIndexes) AS project_idx,
    TRUE AS isBlank,
    CAST(CONCAT('$[', (SELECT COALESCE(MAX(project_idx), -1) + 1 FROM ProjectIndexes), ']') AS VARCHAR(1000)) AS json_path
)
SELECT json_data, json_path FROM (
  -- Combine projects and tasks
  SELECT 
    JSON_OBJECT(
      'docName', docName,
      'text', text,
      'parent', parent,
      'project', project,
      'isProject', TRUE,
      'isBlank', isBlank,
      'expanded', TRUE,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ) AS json_data,
    json_path
  FROM projects
  
  UNION ALL
  
  SELECT 
    JSON_OBJECT(
      'docName', docName,
      'text', text,
      'parent', parent,
      'project', project,
      'isProject', FALSE,
      'isBlank', isBlank,
      'expanded', TRUE,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ) AS json_data,
    json_path
  FROM TaskTree
) combined
ORDER BY json_path;
