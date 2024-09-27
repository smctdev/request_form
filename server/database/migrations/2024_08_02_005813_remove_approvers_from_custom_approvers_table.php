<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class RemoveApproversFromCustomApproversTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('custom_approvers', function (Blueprint $table) {
            $table->dropColumn('approvers');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('custom_approvers', function (Blueprint $table) {
            $table->json('approvers')->nullable();
        });
    }
}
