<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:150',
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('users'), Rule::unique('employees')],
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'login_as' => ['nullable', Rule::in(['customer', 'staff', 'admin'])],
        ]);

        $user = User::where('email', $request->email)->first()
            ?? Employee::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)
            || (isset($validated['login_as']) && $user->role !== $validated['login_as'])) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function updateProfile(Request $request)
    {
        $account = $request->user();
        $isEmployee = $account instanceof Employee;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => [
                'required', 'email', 'max:150',
                Rule::unique($isEmployee ? 'employees' : 'users')->ignore($account->id),
                Rule::unique($isEmployee ? 'users' : 'employees'),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'avatar' => ['required', Rule::in(['user', 'chef', 'coffee', 'heart', 'star', 'sun'])],
        ]);

        $account->update($validated);

        return response()->json([
            'message' => 'Account settings saved.',
            'user' => $account->fresh(),
        ]);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $account = $request->user();
        if (!Hash::check($validated['current_password'], $account->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Your current password is incorrect.'],
            ]);
        }

        $account->update(['password' => Hash::make($validated['password'])]);

        // Revoke other devices' sessions. Keep the current token active.
        $currentTokenId = $account->currentAccessToken()?->getKey();
        $tokens = $account->tokens();
        if ($currentTokenId) {
            $tokens->where('id', '!=', $currentTokenId)->delete();
        } else {
            $tokens->delete();
        }

        return response()->json(['message' => 'Password changed successfully.']);
    }
}
