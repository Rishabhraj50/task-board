const { z } = require('zod');
const task = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(2000).optional(),
  assignee: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  labels: z.array(z.string().trim().min(1).max(30)).optional(),
  column: z.string().optional(),
});
module.exports = {
  signup: z.object({ name: z.string().trim().min(1), email: z.string().email(), password: z.string().min(6) }),
  login: z.object({ email: z.string().email(), password: z.string().min(1) }),
  board: z.object({ name: z.string().trim().min(1).max(80) }),
  invite: z.object({ email: z.string().email() }),
  column: z.object({ name: z.string().trim().min(1).max(60) }),
  task, taskUpdate: task.partial(),
  move: z.object({ columnId: z.string(), beforeId: z.string().nullable().optional() }),
};
