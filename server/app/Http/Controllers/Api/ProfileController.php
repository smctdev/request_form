<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;

use Auth;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function profile()
    {
        $myProfile = Auth::user();

        return response([
            'status'    =>      true,
            'data'      =>      $myProfile,
        ], 200);
    }
}
