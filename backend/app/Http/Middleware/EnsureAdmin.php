<?php

namespace App\Http\Middleware;

use App\Models\Employee;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $account = $request->user();
        abort_unless($account instanceof Employee && $account->role === 'admin', 403, 'Admins only.');
        return $next($request);
    }
}
