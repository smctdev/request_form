<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class RegisterController extends Controller
{
    public function register(Request $request)
    {
        try {
            $positionData = [
                "Accounting Clerk",
                "Accounting Manager",
                "Accounting Staff",
                "Accounting Supervisor",
                "Admin",
                "Area Manager",
                "Assistant Manager",
                "Assistant Web Developer",
                "Audit Manager",
                "Audit Staff",
                "Audit Supervisor",
                "Automation Staff",
                "AVP - Finance",
                "AVP - Sales and Marketing",
                "Branch Supervisor/Manager",
                "Cashier",
                "CEO",
                "HR Manager",
                "HR Staff",
                "IT Staff",
                "IT/Automation Manager",
                "Juinor Web Developer",
                "Managing Director",
                "Payroll Manager",
                "Payroll Staff",
                "Sales Representative",
                "Senior Web Developer",
                "Vice President",
                "User"
              ];
              
            $uservalidate = Validator::make($request->all(), [
                "firstName" => 'required|string|max:255',
                "lastName" => 'required|string|max:255',
                "contact" => 'required|string|max:255',
                "branch_code" => 'required|string|max:255|exists:branches,id',
                "userName" => 'required|string|max:255',
                "email" => "required|email|unique:users,email",
                "password" => "required|min:5",
                "position" => 'required|string|max:255|in:'.implode(',', $positionData),
                "signature" => "sometimes",
                "branch" => "required|string|max:255",
                "employee_id" => "required|string|max:255|unique:users,employee_id",
          
            ]);

            if ($uservalidate->fails()) {
                return response()->json([
                    "errors" => $uservalidate->errors(),
                ]);
            }

        /*     // Decode and save the signature
            $signature = $request->input('signature');
            $signature = str_replace('data:image/png;base64,', '', $signature);
            $signature = str_replace(' ', '+', $signature);
            $signatureData = base64_decode($signature);

            $fileName = 'signature_' . time() . '.png';
            $filePath = public_path('signatures/' . $fileName);

            if (!file_put_contents($filePath, $signatureData)) {
                return response()->json(['error' => 'Unable to save the signature file'], 500);
            } */
            $signature = $request->input('signature');
            $user = User::create([
                "firstName" => $request->firstName,
                "lastName" => $request->lastName,
                "contact" => $request->contact,
                "branch_code" => $request->branch_code,
                "userName" => $request->userName,
                "email" => $request->email,
                "password" => bcrypt($request->password),
                "position" => $request->position,
                'signature' => $signature,
                'role'=> 'User',
                'branch'=> $request->branch,
                'employee_id'=> $request->employee_id,
            ]);

            return response()->json([
                "status" => true,
                "message" => "Registered Successfully",
                "token" => $user->createToken("API TOKEN")->plainTextToken
            ]);
        } catch (\Throwable $th) {
            return response()->json([
                "errors" => $th->getMessage(),
            ]);
        }
    }
}