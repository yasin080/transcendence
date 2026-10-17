<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 20)->nullable()->unique()->after('id');
            $table->string('name')->nullable()->change();
            $table->string('avatar_url')->nullable()->after('email');
            $table->string('bio', 160)->nullable()->after('avatar_url');
        });

        // Usuarios que ya existían: les damos un username único
        DB::table('users')
            ->whereNull('username')
            ->update(['username' => DB::raw("CONCAT('user', id)")]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['username']);
            $table->dropColumn(['username', 'avatar_url', 'bio']);
            $table->string('name')->nullable(false)->change();
        });
    }
};