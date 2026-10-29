<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// The winner was never saved: the end screen works it out from the worms alive.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->dropConstrainedForeignId('winner_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('games', function (Blueprint $table) {
            $table->foreignId('winner_user_id')->nullable()->after('room_id')->constrained('users')->nullOnDelete();
        });
    }
};
