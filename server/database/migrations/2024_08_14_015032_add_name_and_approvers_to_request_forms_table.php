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
        Schema::table('request_forms', function (Blueprint $table) {
            $table->unsignedBigInteger('approvers_id');
            
            $table->foreign('approvers_id')->references('id')->on('custom_approvers');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_forms', function (Blueprint $table) {
            $table->dropForeign(['approvers_id']);
            $table->dropColumn('approvers_id');
        });
    }
};