<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\FriendController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/health', HealthController::class);

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', fn (Request $request) => response()->json(['user' => $request->user()]));

Route::middleware('auth:sanctum')->group(function () {
    // Rooms
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::get('/rooms/current', [RoomController::class, 'current']);
    Route::get('/rooms/{room:code}', [RoomController::class, 'show']);
    Route::post('/rooms/{room:code}/join', [RoomController::class, 'join']);
    Route::post('/rooms/{room:code}/leave', [RoomController::class, 'leave']);
    Route::post('/rooms/{room:code}/kick/{player}', [RoomController::class, 'kick']);
    Route::post('/rooms/{room:code}/bots', [RoomController::class, 'addBot']);
    Route::post('/rooms/{room:code}/games', [GameController::class, 'store']);

    // Games
    Route::get('/games/{game}', [GameController::class, 'show']);
    Route::post('/games/{game}/turn', [GameController::class, 'turn']);
    Route::post('/games/{game}/ping', [GameController::class, 'ping']);
    Route::post('/games/{game}/leave', [GameController::class, 'leave']);

    // Friends
    Route::get('/friends', [FriendController::class, 'index']);
    Route::post('/friends/{user}', [FriendController::class, 'store']);
    Route::post('/friends/{user}/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{user}', [FriendController::class, 'destroy']);

    // Users
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user');
});
