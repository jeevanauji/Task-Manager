<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'assigned_to' => 'required|exists:users,id',
            'title' => 'required|string',
            'priority' => 'in:LOW,MEDIUM,HIGH',
            'due_date' => 'required|date',
        ]);
        $task = Task::create($request->all());
        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $task->assigned_to !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $newStatus = $request->status;

        if ($task->status === 'OVERDUE') {
            if ($newStatus === 'WIP' || $newStatus === 'TODO') {
                return response()->json(['message' => 'Overdue tasks cannot go back to WIP/TODO'], 422);
            }
            if ($newStatus === 'DONE' && $user->role !== 'admin') {
                return response()->json(['message' => 'Only admin can close overdue tasks'], 403);
            }
        }

        $task->update(['status' => $newStatus]);
        return response()->json($task);
    }

    public function myTasks(Request $request)
    {
        $tasks = Task::with('project')
            ->where('assigned_to', $request->user()->id)
            ->get();
        return response()->json($tasks);
    }
}
