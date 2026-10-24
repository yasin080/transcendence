<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Los tokens de Google no se usan: el login solo necesita provider y provider_id
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('oauth_accounts', function (Blueprint $table) {
            $table->dropColumn(['access_token', 'refresh_token']);
        });
    }

    public function down(): void
    {
        Schema::table('oauth_accounts', function (Blueprint $table) {
            $table->text('access_token')->nullable()->after('provider_id');
            $table->text('refresh_token')->nullable()->after('access_token');
        });
    }
};
