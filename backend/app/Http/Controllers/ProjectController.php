<?php

namespace App\Http\Controllers;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index() {
        return response()->json(Project::with('tasks', 'creator')->get());
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required|string']);
        $project = Project::create([
            'name' => $request->name,
            'description' => $request->description,
            'created_by' => $request->user()->id,
        ]);
        return response()->json($project, 201);
    }

    public function show(Project $project) {
        return response()->json($project->load(['tasks.assignee']));
    }

    public function destroy(Project $project) {
        $project->delete();
        return response()->json(['message' => 'Deleted']);
    }
}