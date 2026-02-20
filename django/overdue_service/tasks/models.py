from django.db import models


class Task(models.Model):
    """
    Maps to Laravel's 'tasks' table — no new migrations needed.
    Django reads/writes to the same MySQL table Laravel uses.
    """
    STATUS_TODO = 'TODO'
    STATUS_WIP = 'WIP'
    STATUS_DONE = 'DONE'
    STATUS_OVERDUE = 'OVERDUE'

    STATUS_CHOICES = [
        (STATUS_TODO, 'To Do'),
        (STATUS_WIP, 'Work In Progress'),
        (STATUS_DONE, 'Done'),
        (STATUS_OVERDUE, 'Overdue'),
    ]

    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]

    project_id = models.IntegerField()
    assigned_to = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_TODO)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'  # ✅ Use Laravel's existing table
        managed = False     # ✅ Django won't touch migrations for this table

    def __str__(self):
        return f"{self.title} [{self.status}]"