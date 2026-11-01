<?php

// Accounts with known credentials created by the seeder (values from .env)
return [
    'accounts' => [
        [
            'username' => env('SEED_USER1_USERNAME'),
            'email' => env('SEED_USER1_EMAIL'),
            'password' => env('SEED_USER1_PASSWORD'),
        ],
        [
            'username' => env('SEED_USER2_USERNAME'),
            'email' => env('SEED_USER2_EMAIL'),
            'password' => env('SEED_USER2_PASSWORD'),
        ],
    ],
];