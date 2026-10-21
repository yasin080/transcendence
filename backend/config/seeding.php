<?php

// Cuentas con credenciales conocidas que crea el seeder (valores en .env)
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