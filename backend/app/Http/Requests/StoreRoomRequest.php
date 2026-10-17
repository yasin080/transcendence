<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoomRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:40'],
            'settings' => ['required', 'array:width,height,pillars,softWalls,wrap,tickMs,players,startLength,food,wallHit,bodyHit,controls,camera'],
            'settings.width' => ['required', 'integer', 'between:10,75'],
            'settings.height' => ['required', 'integer', 'between:10,75'],
            'settings.pillars' => ['required', 'boolean'],
            'settings.softWalls' => ['required', 'numeric', 'between:0,0.5'],
            'settings.wrap' => ['required', 'boolean'],
            'settings.tickMs' => ['required', 'integer', 'between:50,1000'],
            'settings.players' => ['required', 'integer', 'between:1,4'],
            'settings.startLength' => ['required', 'integer', 'between:1,6'],
            'settings.food' => ['required', 'integer', 'between:1,50'],
            'settings.wallHit' => ['required', 'in:block,die'],
            'settings.bodyHit' => ['required', 'in:block,die'],
            'settings.controls' => ['required', 'in:turn,dpad'],
            'settings.camera' => ['required', 'in:board,follow'],
        ];
    }
}
