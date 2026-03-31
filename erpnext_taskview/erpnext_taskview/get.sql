WITH RECURSIVE
ProjectIndexes AS (
  SELECT 
    name,
    ROW_NUMBER() OVER (ORDER BY name) - 1 AS project_idx,
    project_name,
    status
  FROM tabProject
  WHERE tabProject.docstatus = 0 %(project_filters)s
),
TaskIndexes AS (
  SELECT
    tabTask.name AS child_name,
    COALESCE(tabTask.parent_task, tabTask.project) AS parent_name,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(tabTask.parent_task, tabTask.project) 
      ORDER BY tabTask.creation
    ) - 1 AS seq_number
  FROM tabTask
  WHERE tabTask.docstatus = 0 %(task_filters)s
),
TaskTree AS (
  -- Base case: Top-level tasks under projects
  SELECT 
    tabTask.name AS docName,
    tabTask.subject AS text,
    tabTask.project AS parent,
    tabTask.project,
    tabTask.status,
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
      WHERE child.parent_task = tabTask.name AND child.docstatus = 0 %(task_filters)s
    ) AS expanded,
    FALSE AS autoFocus,
    CAST(CONCAT('$[', p.project_idx, '].children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask
  JOIN ProjectIndexes p ON tabTask.project = p.name
  JOIN TaskIndexes ti ON tabTask.name = ti.child_name
  WHERE tabTask.parent_task IS NULL AND tabTask.docstatus = 0 %(task_filters)s
  
  UNION ALL
  
  -- Recursive case: Nested tasks
  SELECT 
    tabTask.name,
    tabTask.subject,
    tabTask.parent_task,
    tabTask.project,
    tabTask.status,
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
      WHERE child.parent_task = tabTask.name AND child.docstatus = 0 %(task_filters)s
    ) AS expanded,
    FALSE as autoFocus,
    CAST(CONCAT(tt.json_path, '.children[', ti.seq_number, ']') AS VARCHAR(1000)) AS json_path
  FROM tabTask
  JOIN TaskTree tt ON tabTask.parent_task = tt.docName
  JOIN TaskIndexes ti ON tabTask.name = ti.child_name
  WHERE tabTask.docstatus = 0 %(task_filters)s
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
