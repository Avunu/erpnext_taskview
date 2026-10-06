---
title: Giving customers access
description: How to give a customer access to the client portal, the exact rules that decide who sees which project, and what customers can see and change once they are in.
nav_title: Giving access
order: 8
updated: 2026-10-06
---

This page is for the administrator who gives customers access to the [client portal](README.md). Three things must be true for a customer to see a project: the person has a login, the login is tied to the right customer or project, and the project belongs to that customer.

## Who can open a project

A portal user sees a project when **any one** of these is true:

| Rule | Where you set it |
| --- | --- |
| One of their Contacts is linked to the project's customer | A **Contact** with a link to the **Customer**, and with the person's email (or the Contact's **User Id** field set) |
| They are in the customer's portal users | **Customer**, **Portal Users** tab, **Customer Portal Users** table |
| They are listed in the project's own users | **Project**, **Users** table |

The first rule matches a Contact to a login by the Contact's **User Id** field, its **Email Address**, or any email address in its **Email IDs** table. Email addresses are compared without regard to case. The project must have its **Customer** field set for the first two rules to find it.

Cancelled projects are never available to a customer. A name that does not exist and a name that belongs to someone else get the same answer, "You do not have access to this project.", so nobody can probe for projects they were not given.

## Give a customer access

1. **Create the user.** Add a **User** for the client with the user type **Website User**, and give them the **Customer** role. The portal menu entry is restricted to that role.
2. **Link them to the customer.** Use either of these:
   - Link a **Contact** to the project's **Customer**, with the person's email on the Contact.
   - Or add the user to **Portal Users** on the Customer.
3. **Set the project's Customer**, so that the project falls under that link.

To give one person access to a single project without tying them to the customer, add them to the **Users** table on that project instead.

> [!WARNING]
> Give clients the **Website User** type. A user of type **System User** is treated as staff: they see every project their ERPNext permissions allow, they can open the desk from the portal, and what they do on the portal does not notify the team.

> [!NOTE]
> ERPNext helps with step 2. In ERPNext 16.35, saving a new row in a customer's Portal Users adds the Customer role to that user when you are a System Manager (otherwise it shows a message asking you to add the role), and links any existing Contact that matches the user's email or User Id to the customer (it does not create a Contact). The portal itself does not check roles: the rules in the table above decide access, and the Customer role only makes the **Projects** entry appear in the portal menu.

## What customers can see

A customer who can open a project can see all of the following on it, with no per-task or per-comment setting to hide any of it.

| What | Detail |
| --- | --- |
| Projects and tasks | Status, due date, priority and the full names of assignees. Phases appear with their budgets. Cancelled tasks are left out of the lists and counts, and template tasks are never shown. |
| Descriptions | The task description as written in the desk. Private images and links in it are served through a permission-checked download, not a public address. |
| Comments | **Every** comment on the task, including those written by staff. Staff replies carry a **Team** badge. |
| Time entries | Date, the person's name, the work description, the hours, whether it is billable, and whether a timer is still running. Rows on draft and submitted Timesheets are included, for the task and all of its subtasks. |
| Files | Every file attached to the task, including files staff attached. |
| Budgets | Hours budgeted and logged for each task, phase and project. Hours only: no rates or amounts. |
| Recent activity | The latest 20 comments, files, status changes, time entries and new tasks on the project. |

> [!WARNING]
> Anything written on a task or in a timer's description can be read by the customers of that project. Do not use task comments or time descriptions for internal notes.

> [!WARNING]
> The portal ignores the **Hide timesheets** and **View attachments** options on the project's **Users** table. Those belong to ERPNext's older project page. On this portal time entries and files are always shown.

## What customers can change

- **Add tasks** to a project that is not Completed or Cancelled, optionally under an open phase.
- **Comment** on any task and **attach files** to it.
- **Move a task** to Open, Working, Pending Review or Completed. A customer can move **any** task that is not a phase, not only the ones they added. Moving a task to Completed closes its assignments, as it does in the desk, and is refused when it depends on tasks that are not completed or cancelled.

Files from customers are saved as private files attached to the task. Customers can attach JPG, PNG, GIF, PDF, TXT and CSV files and Microsoft Office documents. Staff using the portal are not held to that list. Descriptions and comments written by a customer are cleaned before they are saved: images, styles and scripts are removed, so a customer cannot paste an image or forge an `@mention`.

Each customer action is limited to 60 new tasks, 60 comments and 60 uploads per hour from one IP address. Customers behind one office network share that count.

## Notifications for the team

A customer who adds a task, comments, attaches a file or moves a task creates a **Client Portal** notification for the team. See [How the team is told](README.md#how-the-team-is-told) for who receives it. To get the email too, each recipient needs **Client Portal** in their Notification Settings: see [Install and upgrade](../install.md#finish-the-portal-set-up) for turning it on for all users.

## Preview the portal as staff

Staff (System Users) can open `/projects` too. They see the projects their normal ERPNext permissions allow, apart from Cancelled ones, and anything they change is saved with those permissions. The account menu has an **Open desk** entry. Use this to check how a project looks, but remember that staff see more than a client does. The surest check is to sign in as a test customer user, set up exactly as in the steps above.

## When a customer cannot see a project

Work down this list.

1. Is the user's type **Website User**? A System User gets the staff view instead.
2. Is the project's **Customer** set, and is it the customer the person is linked to?
3. Is the person linked: a Contact on that customer whose email matches the login, or a row in the customer's Portal Users, or a row in the project's Users?
4. Is the project Cancelled?
5. Does `/projects` open at all? If not, the assets have not been built: see [Install and upgrade](../install.md).
6. Is the **Projects** entry missing from the portal menu? The user needs the **Customer** role.

## How access is enforced

Customers hold no permissions on the Project or Task documents. ERPNext's permission check does not consult website permissions for these documents, so every portal endpoint first passes through `erpnext_taskview.portal.access` and only then reads or writes with permission checks off. Staff are the exception: they write with their own permissions. The code is described in [How it works](../development/architecture.md#the-portal-api).
