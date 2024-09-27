<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddBranchAndEmployeeIdToUsersTable2 extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add branch column
            $table->string('branch');

            // Add employee_id column
            $table->string('employee_id');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            // Rollback changes if needed
            $table->dropColumn('branch');
            $table->dropColumn('employee_id');
        });
    }
}
