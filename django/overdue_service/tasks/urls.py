from django.urls import path
from . import views

urlpatterns = [
    path('mark-overdue/', views.MarkOverdueView.as_view(), name='mark-overdue'),

    path('overdue-tasks/', views.OverdueTasksListView.as_view(), name='overdue-tasks'),

    path('tasks/<int:task_id>/status/', views.UpdateTaskStatusView.as_view(), name='update-task-status'),

    path('stats/', views.TaskStatsView.as_view(), name='stats'),
]