<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $positions = [
            ['label' => 'Accounting Clerk', 'value' => 'Accounting Clerk', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Manager', 'value' => 'Accounting Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Staff', 'value' => 'Accounting Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Accounting Supervisor', 'value' => 'Accounting Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Area Manager', 'value' => 'Area Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Manager', 'value' => 'Assistant Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Assistant Web Developer', 'value' => 'Assistant Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Audit Manager', 'value' => 'Audit Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Audit Staff', 'value' => 'Audit Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Audit Supervisor', 'value' => 'Audit Supervisor', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Automation Staff', 'value' => 'Automation Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'AVP - Finance', 'value' => 'AVP - Finance', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'AVP - Finance Staff', 'value' => 'AVP - Finance Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'AVP - Sales and Marketing', 'value' => 'AVP - Sales and Marketing', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Branch Supervisor/Manager', 'value' => 'Branch Supervisor/Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Cashier', 'value' => 'Cashier', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'CEO', 'value' => 'CEO', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Manager', 'value' => 'HR Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'HR Staff', 'value' => 'HR Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'IT Staff', 'value' => 'IT Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'IT/Automation Manager', 'value' => 'IT/Automation Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Junior Web Developer', 'value' => 'Junior Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Managing Director', 'value' => 'Managing Director', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Payroll Manager', 'value' => 'Payroll Manager', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Payroll Staff', 'value' => 'Payroll Staff', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Sales Representative', 'value' => 'Sales Representative', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Senior Web Developer', 'value' => 'Senior Web Developer', 'created_at' => now(), 'updated_at' => now()],
            ['label' => 'Vice President', 'value' => 'Vice President', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('positions')->insert($positions);
    }
}
