<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Attachment;
use Illuminate\Support\Facades\Auth;

class AttachmentController extends Controller
{
    public function store(Request $request)
    {
        // Validate the uploaded file
        $request->validate([
            'attachment' => 'required|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);
    
        try {
            $attachmentFile = $request->file('attachment');
            $path = $attachmentFile->store('attachments', 'public');
            $filename = $attachmentFile->getClientOriginalName();
    
            $createdAttachment = Attachment::create([
                'file_name' => $filename,  // Include file_name here
                'file_path' => $path, 
            ]);
    
            return response()->json([
                'message' => 'Attachment uploaded successfully',
                'attachment_id' => $createdAttachment->id,
            ], 201);
        } catch (\Exception $e) {
            // Return error response
            return response()->json([
                'message' => 'Failed to upload attachment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
}
