<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Broadcast;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
    Broadcast::routes(['middleware' => ['auth']]);
    
    require base_path('routes/channels.php');
    }
}