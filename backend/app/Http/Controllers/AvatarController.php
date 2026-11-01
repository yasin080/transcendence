<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AvatarController extends Controller
{
    // Lado del cuadrado al que se reduce cada avatar subido
    private const SIZE = 256;

    // POST /api/user/avatar — sube una imagen como avatar del usuario autenticado.
    // Se guarda en la BD como data URL (base64), ya recortada y reducida.
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'file', 'mimes:png,jpg,jpeg', 'max:2048', 'dimensions:max_width=4096,max_height=4096'],
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

    // Recorta al cuadrado central, reduce a SIZE×SIZE y codifica en base64.
    // PNG conserva la transparencia; JPEG pesa mucho menos para fotos.
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
