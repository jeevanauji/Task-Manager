<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// Public
Route::post('/login', [AuthController::class, 'login']);

// Protected
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/my-tasks', [TaskController::class, 'myTasks']);

    // Admin only
    Route::middleware('admin')->group(function () {
        Route::apiResource('projects', ProjectController::class);
        Route::post('/tasks', [TaskController::class, 'store']);
    });

    Route::put('/tasks/{task}', [TaskController::class, 'update']);
});
