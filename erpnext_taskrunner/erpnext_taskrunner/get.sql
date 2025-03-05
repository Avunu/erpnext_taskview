WITH 
ProjectList AS (
    -- Get all projects with their index
    SELECT 
        name,
        project_name,
        status,
        ROW_NUMBER() OVER (ORDER BY name) - 1 AS project_idx
    FROM tabProject 
    WHERE docstatus = 0 %(project_filters)s
),
TimesheetDetails AS (
    -- Get active timesheet details for the employee
    SELECT
        td.name,
        td.parent,
        project,
        task,
        from_time,
        to_time,
        hours,
        paused,
        start_time,
        paused_time_in_seconds
    FROM `tabTimesheet Detail` td
	JOIN `tabTimesheet` t ON td.parent = t.name
    WHERE 
        t.employee = '%(employee)s'
        AND to_time IS NULL
),
TaskList AS (
    -- Get all tasks with their relevant fields and timesheet status
    SELECT
        tabTask.name AS docName,
        tabTask.subject AS text,
        tabTask.parent_task,
        tabTask.project,
        tabTask.status,
        p.project_idx,
        0 AS isProject,
        0 AS isBlank,
        CASE WHEN td_timer.task IS NOT NULL THEN
            JSON_OBJECT(
                'name', td_timer.name,
                'parent', td_timer.parent,
                'project', td_timer.project,
                'task', td_timer.task,
                'from_time', td_timer.from_time,
                'to_time', td_timer.to_time,
                'hours', td_timer.hours,
                'paused', td_timer.paused,
                'start_time', td_timer.start_time,
                'paused_time_in_seconds', td_timer.paused_time_in_seconds
            )
        ELSE NULL END AS timesheetDetail,
        CASE WHEN td_project.project IS NOT NULL THEN 1 ELSE 0 END AS expanded,
        0 AS autoFocus,
        COALESCE(td_timer.task IS NOT NULL, 0) AS has_timer
    FROM tabTask
    JOIN ProjectList p ON tabTask.project = p.name
    LEFT JOIN TimesheetDetails td_timer ON td_timer.task = tabTask.name
    LEFT JOIN TimesheetDetails td_project ON td_project.project = tabTask.project
    WHERE tabTask.docstatus = 0 %(task_filters)s
),
AllNodes AS (
    -- Combine projects and tasks into a single list
    SELECT
        p.name AS docName,
        CONCAT(p.name, ': ', p.project_name) AS text,
        NULL AS parent_task,
        p.name AS project,
        p.status,
        p.project_idx,
        1 AS isProject,
        0 AS isBlank,
        NULL AS timesheetDetail,
        -- Set project expanded=1 if it has any active timer via simple join
        CASE WHEN td.project IS NOT NULL THEN 1 ELSE 0 END AS expanded,
        0 AS autoFocus,
        0 AS has_timer
    FROM ProjectList p
    LEFT JOIN TimesheetDetails td ON td.project = p.name
    GROUP BY p.name, p.project_name, p.status, p.project_idx
    
    UNION ALL
    
    SELECT * FROM TaskList
),
NodePaths AS (
    -- Generate paths for the hierarchy
    SELECT
        n.*,
        CASE 
            WHEN n.isProject THEN 
                CAST(CONCAT('$[', n.project_idx, ']') AS VARCHAR(1000))
            ELSE
                CAST(CONCAT('$[', n.project_idx, '].children[',
                    ROW_NUMBER() OVER (
                        PARTITION BY CASE 
                            WHEN n.parent_task IS NULL THEN n.project 
                            ELSE n.parent_task 
                        END
                        ORDER BY n.docName
                    ) - 2,
                ']') AS VARCHAR(1000))
        END AS json_path
    FROM AllNodes n
)
SELECT
    JSON_OBJECT(
        'docName', docName,
        'text', text,
        'parent', parent_task,
        'project', project,
        'status', status,
        'isProject', isProject,
        'isBlank', isBlank,
        'timesheetDetail', timesheetDetail,
        'expanded', expanded,
        'autoFocus', autoFocus,
        'children', JSON_ARRAY()
    ) AS json_data,
    json_path
FROM NodePaths
ORDER BY json_path;