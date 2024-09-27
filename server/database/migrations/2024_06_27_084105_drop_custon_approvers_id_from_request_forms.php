<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('approval_processes', function (Blueprint $table) {
            $table->dropForeign('approval_processes_custom_approvers_id_foreign');

             $table->dropColumn('custom_approvers_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('approval_processes', function (Blueprint $table) {
            //
        });
    }
};
