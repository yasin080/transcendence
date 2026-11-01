<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AvatarController extends Controller
{
    private const SIZE = 256;

    // POST /api/user/avatar — uploads an image as the authenticated user's avatar.
    // Stored in the DB as a base64 data URL, already cropped and resized.
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'file', 'mimes:png,jpg,jpeg', 'max:2048'],
        ]);

        $file = $request->file('avatar');
        $source = @imagecreatefromstring((string) file_get_contents($file->getRealPath()));
        if ($source === false) {
            throw ValidationException::withMessages(['avatar' => 'That file is not a valid image.']);
        }

        $user = $request->user();
        $user->update(['avatar' => $this->toDataUrl($source, $file->getMimeType() === 'image/png')]);

        return response()->json(['avatar' => $user->avatar]);
    }

    // Crops to the centre square, scales to SIZE×SIZE and encodes as base64.
    // PNG keeps transparency; JPEG is much lighter for photos.
    private function toDataUrl(\GdImage $source, bool $png): string
    {
        $side = min(imagesx($source), imagesy($source));
        $x = intdiv(imagesx($source) - $side, 2);
        $y = intdiv(imagesy($source) - $side, 2);

        $avatar = imagecreatetruecolor(self::SIZE, self::SIZE);
        if ($png) {
            imagealphablending($avatar, false);
            imagesavealpha($avatar, true);
            imagefill($avatar, 0, 0, imagecolorallocatealpha($avatar, 0, 0, 0, 127));
        }
        imagecopyresampled($avatar, $source, 0, 0, $x, $y, self::SIZE, self::SIZE, $side, $side);

        ob_start();
        $png ? imagepng($avatar, null, 9) : imagejpeg($avatar, null, 85);
        $bytes = (string) ob_get_clean();

        return 'data:image/' . ($png ? 'png' : 'jpeg') . ';base64,' . base64_encode($bytes);
    }
}
