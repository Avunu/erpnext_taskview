WITH RECURSIVE TaskTree AS (
  SELECT 
    t.name as docName,
    t.subject as text,
    t.parent_task as parent,
    t.project,
    p.name as project_name,
    p.idx as project_idx,
    t.idx as task_idx,
    1 as level,
    CONCAT('$[', p.idx - 1, '].children[', t.idx - 1, ']') as json_path
  FROM tabTask t
  JOIN tabProject p ON t.project = p.name
  WHERE t.parent_task IS NULL
  
  UNION ALL
  
  SELECT 
    t.name,
    t.subject,
    t.parent_task,
    t.project,
    tt.project_name,
    tt.project_idx,
    t.idx,
    tt.level + 1,
    IF(
      LENGTH(CONCAT(tt.json_path, '.children[', t.idx - 1, ']')) <= 200,
      CONCAT(tt.json_path, '.children[', t.idx - 1, ']'),
      NULL
    )
  FROM tabTask t
  JOIN TaskTree tt ON t.parent_task = tt.docName
  WHERE LENGTH(tt.json_path) <= 200
),
projects AS (
  SELECT 
    name as docName,
    project_name as text,
    NULL as parent,
    NULL as project,
    CONCAT('$[', idx - 1, ']') as json_path
  FROM tabProject
)
SELECT json_data, json_path FROM (
  SELECT 
    JSON_OBJECT(
      'docName', docName,
      'text', text,
      'parent', parent,
      'project', project,
      'isProject', TRUE,
      'isBlank', FALSE,
      'expanded', TRUE,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ) as json_data,
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
      'isBlank', FALSE,
      'expanded', TRUE,
      'autoFocus', FALSE,
      'children', JSON_ARRAY()
    ),
    json_path
  FROM TaskTree
) combined
ORDER BY json_path;