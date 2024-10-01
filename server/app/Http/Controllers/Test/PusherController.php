<?php

namespace App\Http\Controllers\Test;

use App\Events\MyEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class PusherController extends Controller
{
public function index()
{
$test = 'INCREASE IS WAVING?';
event(new MyEvent($test));

return view('welcome');
}
}