<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;

class NotificationEvent implements ShouldBroadcast, ShouldDispatchAfterCommit 
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    protected $count;
    protected $user_id;

    public function __construct($user_id,$count)
    {
        $this->user_id = $user_id;
        $this->count = $count;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->user_id),
        ];
    }
    public function via($notifiable)
    {
        return ['broadcast'];
    }
    public function broadcastWith()
    {
        return [
            'count' => $this->count
        ];
    }
}