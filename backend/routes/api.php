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
    Route::post('/rooms', [RoomController::class, 'store']);
    Route::post('/rooms/{room:code}/games', [GameController::class, 'store']);
    Route::get('/games/{game}', [GameController::class, 'show']);
    
    Route::get('/friends', [FriendController::class, 'index']);
    Route::get('/users/search', [FriendController::class, 'search']);
    Route::get('/users/{user}', [UserController::class, 'show'])->whereNumber('user');
    Route::post('/friends/{user}', [FriendController::class, 'store']);
    Route::post('/friends/{user}/accept', [FriendController::class, 'accept']);
    Route::delete('/friends/{user}', [FriendController::class, 'destroy']);
});
