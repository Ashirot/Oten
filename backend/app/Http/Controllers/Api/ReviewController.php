<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index()
    {
        // Public testimonials must never expose customer phone, delivery address,
        // or the linked order's private details.
        $reviews = Review::with(['user:id,name,avatar', 'product:id,name'])
            ->orderBy('id', 'desc')->get();
        return response()->json($reviews);
    }

    public function store(Request $request)
    {
        abort_unless($request->user() instanceof User, 403, 'Sign in as a customer to review.');
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'product_id' => 'nullable|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        $order = Order::findOrFail($validated['order_id']);
        abort_unless($order->user_id === $request->user()->id, 403, 'You cannot review someone else\'s order.');

        $review = Review::create([
            'order_id' => $order->id,
            'user_id' => $request->user()->id,
            'product_id' => $validated['product_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Thank you for your review!',
            'review' => $review->load(['user', 'product']),
        ], 201);
    }
}
