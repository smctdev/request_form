<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('approvers', function (Blueprint $table) {
            // Add branch column
            $table->string('branch')->nullable();

            // Add employee_id column
            $table->string('employee_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('approvers', function (Blueprint $table) {
            // Drop branch column
            $table->dropColumn('branch');

            // Drop employee_id column
            $table->dropColumn('employee_id');
        });
    }
};
