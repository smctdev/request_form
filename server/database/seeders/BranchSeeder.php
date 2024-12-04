<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BranchSeeder extends Seeder
{
    public function run(): viod
    {
        $branches = [
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
            ['branch_code' => '', 'branch_name' => '', 'acronym' => '', 'created_at' => now(), 'updated_at' => now()],
        ];
        
        DB::table('branches')->insert($branches);
    }
}