from datetime import date
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Task


def mark_overdue_tasks():
    """
    Core overdue logic:
    - Tasks with due_date in the past AND status not DONE → mark as OVERDUE
    """
    today = date.today()
    overdue_tasks = Task.objects.filter(
        due_date__lt=today
    ).exclude(
        status__in=[Task.STATUS_DONE, Task.STATUS_OVERDUE]
    )
    count = overdue_tasks.update(status=Task.STATUS_OVERDUE)
    return count


class MarkOverdueView(APIView):
    """
    POST /api/mark-overdue/
    Marks all eligible tasks as OVERDUE.
    Call this from a cron job or scheduler.
    """
    def post(self, request):
        count = mark_overdue_tasks()
        return Response({
            'success': True,
            'message': f'{count} task(s) marked as OVERDUE.',
            'count': count
        }, status=status.HTTP_200_OK)


class OverdueTasksListView(APIView):
    """
    GET /api/overdue-tasks/
    Returns all currently overdue tasks.
    """
    def get(self, request):
        tasks = Task.objects.filter(status=Task.STATUS_OVERDUE).values(
            'id', 'title', 'status', 'priority', 'due_date',
            'project_id', 'assigned_to'
        )
        return Response({
            'success': True,
            'data': list(tasks)
        })


class UpdateTaskStatusView(APIView):
    """
    PUT /api/tasks/<id>/status/
    Handles overdue business rules:
    - Overdue tasks cannot go back to WIP or TODO
    - Only admin (role check via header) can close overdue tasks
    """
    def put(self, request, task_id):
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({'success': False, 'message': 'Task not found'}, status=404)

        new_status = request.data.get('status')
        is_admin = request.headers.get('X-User-Role') == 'admin'

        if not new_status:
            return Response({'success': False, 'message': 'status is required'}, status=400)

        # ✅ Overdue rules
        if task.status == Task.STATUS_OVERDUE:
            if new_status in [Task.STATUS_WIP, Task.STATUS_TODO]:
                return Response({
                    'success': False,
                    'message': 'Overdue tasks cannot be moved back to WIP or TODO.'
                }, status=422)

            if new_status == Task.STATUS_DONE and not is_admin:
                return Response({
                    'success': False,
                    'message': 'Only admins can close overdue tasks.'
                }, status=403)

        task.status = new_status
        task.save()

        return Response({
            'success': True,
            'message': f'Task status updated to {new_status}.',
            'task_id': task.id,
            'new_status': new_status
        })


class TaskStatsView(APIView):
    """
    GET /api/stats/
    Returns task counts by status.
    """
    def get(self, request):
        from django.db.models import Count
        stats = Task.objects.values('status').annotate(count=Count('id'))
        return Response({
            'success': True,
            'data': {s['status']: s['count'] for s in stats}
        })