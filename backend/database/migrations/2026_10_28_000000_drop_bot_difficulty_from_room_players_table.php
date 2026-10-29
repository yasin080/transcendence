<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Never written: a seat without a user is a bot, and the room's botMistakes
// setting is its difficulty.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_players', function (Blueprint $table) {
            $table->dropColumn('bot_difficulty');
        });
    }

    public function down(): void
    {
        Schema::table('room_players', function (Blueprint $table) {
            $table->string('bot_difficulty')->nullable()->after('seat');
        });
    }
};
