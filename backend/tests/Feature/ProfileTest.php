<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    private function payload(User $user, array $changes = []): array
    {
        return [
            'username' => $user->username,
            'name' => $user->name,
            'email' => $user->email,
            'bio' => $user->bio,
            ...$changes,
        ];
    }

    public function test_a_user_can_update_their_profile(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, [
            'username' => 'NuevoNick',
            'name' => 'Aritz',
            'bio' => 'Hola',
        ]))->assertOk()
            ->assertJsonPath('username', 'NuevoNick')
            ->assertJsonPath('name', 'Aritz')
            ->assertJsonPath('bio', 'Hola');
    }

    public function test_keeping_the_same_username_is_allowed(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user))->assertOk();
    }

    public function test_a_taken_username_is_rejected(): void
    {
        User::factory()->create(['username' => 'Ocupado']);
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, ['username' => 'Ocupado']))
            ->assertFails(422)->assertJsonValidationErrors('username');
    }

    public function test_changing_email_requires_the_current_password(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, ['email' => 'nuevo@example.com']))
            ->assertFails(422)->assertJsonValidationErrors('current_password');

        $this->patchJson('/api/user', $this->payload($user, [
            'email' => 'nuevo@example.com',
            'current_password' => 'mala',
        ]))->assertFails(422)->assertJsonValidationErrors('current_password');
    }

    public function test_a_user_can_change_their_password(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, [
            'password' => 'nueva-clave',
            'password_confirmation' => 'nueva-clave',
            'current_password' => 'password',
        ]))->assertOk();

        $this->assertTrue(Hash::check('nueva-clave', $user->fresh()->password));
    }

    public function test_a_google_user_can_set_a_password_without_a_current_one(): void
    {
        $user = User::factory()->create(['password' => null]);
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, [
            'password' => 'nueva-clave',
            'password_confirmation' => 'nueva-clave',
        ]))->assertOk();

        $this->assertTrue(Hash::check('nueva-clave', $user->fresh()->password));
    }

    public function test_a_guest_cannot_update_a_profile(): void
    {
        $this->patchJson('/api/user', ['username' => 'Nadie'])->assertFails(401);
    }

    public function test_an_uploaded_avatar_is_stored_resized_as_base64(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $avatar = $this->post('/api/user/avatar', [
            'avatar' => UploadedFile::fake()->image('yo.png', 600, 400),
        ])->assertOk()->json('avatar');

        $this->assertStringStartsWith('data:image/png;base64,', $avatar);
        $this->assertSame($avatar, $user->fresh()->avatar);

        // Cropped to the centre square and scaled to 256×256
        $bytes = base64_decode(substr($avatar, strlen('data:image/png;base64,')));
        [$width, $height] = getimagesizefromstring($bytes);
        $this->assertSame([256, 256], [$width, $height]);
    }

    public function test_a_jpeg_avatar_stays_jpeg(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/api/user/avatar', ['avatar' => UploadedFile::fake()->image('yo.jpg')])
            ->assertOk()
            ->assertJsonPath('avatar', fn (string $avatar) => str_starts_with($avatar, 'data:image/jpeg;base64,'));
    }

    public function test_a_non_image_avatar_is_rejected(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/user/avatar', [
            'avatar' => UploadedFile::fake()->create('virus.pdf', 10, 'application/pdf'),
        ])->assertFails(422)->assertJsonValidationErrors('avatar');
    }

    public function test_a_user_can_pick_a_gallery_avatar_but_not_any_value(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, ['avatar' => User::AVATAR_PRESETS[0]]))
            ->assertOk()->assertJsonPath('avatar', User::AVATAR_PRESETS[0]);

        $this->patchJson('/api/user', $this->payload($user, ['avatar' => 'data:image/png;base64,AAAA']))
            ->assertFails(422)->assertJsonValidationErrors('avatar');
    }

    public function test_saving_without_avatar_keeps_the_uploaded_one(): void
    {
        $user = User::factory()->create(['avatar' => 'data:image/png;base64,AAAA']);
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, ['bio' => 'Nueva']))->assertOk();

        $this->assertSame('data:image/png;base64,AAAA', $user->fresh()->avatar);
    }

    public function test_a_user_can_go_back_to_the_default_avatar(): void
    {
        $user = User::factory()->create(['avatar' => User::AVATAR_PRESETS[0]]);
        $this->actingAs($user);

        $this->patchJson('/api/user', $this->payload($user, ['avatar' => null]))->assertOk();

        $this->assertNull($user->fresh()->avatar);
    }
}
