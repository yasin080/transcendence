<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Testing\TestResponse;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Expected failures come back as 200 with ok:false (SoftFailures).
        TestResponse::macro('assertFails', function (int $status) {
            return $this->assertOk()->assertJsonPath('ok', false)->assertJsonPath('status', $status);
        });
    }
}
