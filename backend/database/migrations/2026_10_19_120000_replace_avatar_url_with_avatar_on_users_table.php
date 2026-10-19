<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// El avatar pasa de ser una URL a guardarse en la BD: ruta de la galería
// (/avatar/...) o la imagen subida como data URL en base64.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->longText('avatar')->nullable()->after('email');
        });

        // Las rutas de la galería se conservan; lo demás vuelve al avatar por defecto
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
