# Schema
```mermaid
erDiagram
  USER ||--o{ BOARD : owns
  USER }o--o{ BOARD : "member of (Board.members[])"
  BOARD ||--o{ COLUMN : has
  BOARD ||--o{ TASK : has
  COLUMN ||--o{ TASK : contains
  USER ||--o{ TASK : "assigned (Task.assignee)"
  TASK { string title string description date dueDate string priority string[] labels number position array activity }
```
**Embedded:** `labels`, `activity` (small, owned by the task, never queried alone). **Referenced:** members, columns, tasks (shared, unbounded, moved/filtered independently).
**Indexes:** `Board{members}`, `Column{board,order}`, `Task{board,column,position}`, `Task{board,assignee}`, `Task{board,dueDate}`, `User{email}` unique.
