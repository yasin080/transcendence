<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:40',
                Rule::unique('rooms', 'name')->whereIn('status', ['open', 'playing']),
            ],
            'quick' => ['sometimes', 'boolean'],
            'settings' => ['required', 'array:width,height,pillars,softWalls,wrap,tickMs,players,startLength,food,bombs,wallHit,bodyHit,controls,camera,botMistakes'],
            // Odd side: with an even one, seat 2 spawns facing a pillar (pillars sit on even x and y)
            'settings.width' => ['required', 'integer', 'between:11,75', fn ($attribute, $value, $fail) => $value % 2 === 1 || $fail('The board side must be odd.')],
            // Square board: the start length is capped by the width and the worms spawn in the four corners
            'settings.height' => ['required', 'integer', 'same:settings.width'],
            'settings.pillars' => ['required', 'boolean'],
            // With pillars there are no random walls
            'settings.softWalls' => ['required', 'numeric', 'between:0,'.($this->boolean('settings.pillars') ? 0 : 0.5)],
            'settings.wrap' => ['required', 'boolean'],
            'settings.tickMs' => ['required', 'integer', 'between:50,1000'],
            'settings.players' => ['required', 'integer', 'between:1,4'],
            // The start length grows with the board: up to 30% of the width
            'settings.startLength' => ['required', 'integer', 'between:1,'.intdiv((int) $this->input('settings.width') * 3, 10)],
            'settings.food' => ['required', 'integer', 'between:1,50'],
            'settings.bombs' => ['required', 'integer', 'between:0,10'],
            // With pillars, hitting a wall cannot kill
            'settings.wallHit' => ['required', Rule::in($this->boolean('settings.pillars') ? ['block'] : ['block', 'die'])],
            'settings.bodyHit' => ['required', 'in:block,die'],
            'settings.controls' => ['required', 'in:turn,dpad'],
            'settings.camera' => ['required', 'in:board,follow,head'],
            // Percentage of ticks in which a bot doesn't look where it's going
            'settings.botMistakes' => ['required', 'integer', 'between:20,80'],
        ];
    }
}
