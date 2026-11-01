<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// The avatar is now stored in the DB: either a gallery path (/avatar/...)
// or the uploaded image as a base64 data URL.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->longText('avatar')->nullable()->after('email');
        });

        // Keep gallery paths; anything else falls back to the default avatar
        DB::table('users')
            ->where('avatar_url', 'like', '/avatar/%')
            ->update(['avatar' => DB::raw('avatar_url')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar_url')->nullable()->after('email');
        });

        DB::table('users')
            ->where('avatar', 'like', '/avatar/%')
            ->update(['avatar_url' => DB::raw('avatar')]);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};
