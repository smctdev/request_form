<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class LoginController extends Controller
{
 
    public function login(Request $request)
    {
        try {
            // Validate the request data
            $validator = Validator::make($request->all(), [
                'email'    => 'required|email',
                'password' => 'required',
            ]);
    
            // If validation fails, return errors
            if ($validator->fails()) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Validation Error.',
                    'errors'  => $validator->errors(),
                ]);
            }
    
            // Attempt to authenticate the user
            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json([
                    'status'  => false,
                    'message' => 'Email or password does not match our records.',
                ]);
            }
    
            // Get the authenticated user
            $user = Auth::user();
    
            // Generate a new token for the user
            $tokenResult = $user->createToken('API TOKEN');
            $token = $tokenResult->accessToken;
    
           
            $expiration = now()->addHours(8);
    
            // Update the token's expiration time in the database
            DB::table('personal_access_tokens')
                ->where('token', hash('sha256', $token))
                ->update(['expires_at' => $expiration]);
    
            // Return user data along with the token and expiration time
            return response()->json([
                'status'           => true,
                'message'          => 'Login successful. Redirecting you to Dashboard.',
                'token'            => $tokenResult->plainTextToken,
                'expires_at'       => $expiration,
                'role'             => $user->role,
                'id'               => $user->id,
                'firstName'        => $user->firstName,
                'lastName'         => $user->lastName,
                'branch_code'      => $user->branch_code,
                'contact'          => $user->contact,
                'signature'        => $user->signature,
                'email'            => $user->email,
                'profile_picture'  => $user->profile_picture,
                'employee_id'      => $user->employee_id,
            ]);
        } catch (\Throwable $th) {
            // Handle unexpected errors
            return response()->json([
                'status'  => false,
                'message' => 'An error occurred. Please try again later.',
            ], 500);
        }
    }
    

}
